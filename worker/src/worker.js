/**
 * Cloudflare Worker for Bikehouse Lein Bookings
 * 
 * Endpoints:
 * - GET /api/health - Health check
 * - GET /api/availability?date=YYYY-MM-DD - Get available booking slots
 * - POST /api/bookings - Create a new booking
 * - GET /api/bookings - List all bookings
 * 
 * Environment Secrets (set in Cloudflare):
 * - GOOGLE_SERVICE_ACCOUNT: Full JSON of Google Service Account
 * - GOOGLE_CALENDAR_ID: Calendar ID for bookings
 * - GOOGLE_SPREADSHEET_ID: Spreadsheet ID for booking records
 */

import { GoogleServiceAccountAuth } from './google-auth';
import { GoogleCalendarAPI } from './google-calendar';
import { GoogleSheetsAPI } from './google-sheets';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(),
    },
  });
}

function parseServiceAccount(secret) {
  if (!secret) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT secret');
  }

  try {
    return JSON.parse(secret);
  } catch (error) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT must contain valid JSON');
  }
}

function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !Number.isNaN(new Date(dateString).getTime());
}

function isValidTime(timeString) {
  return /^\d{2}:\d{2}$/.test(timeString);
}

function parseDateTime(date, time) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0);
}

function generateSlots(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const start = new Date(year, month - 1, day, 9, 0, 0, 0);
  const end = new Date(year, month - 1, day, 17, 0, 0, 0);

  const slots = [];
  let current = new Date(start);

  while (current < end) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + 30 * 60 * 1000);
  }

  return { start, end, slots };
}

/**
 * GET /api/health
 * Health check endpoint
 */
async function handleHealth(request, env) {
  try {
    return jsonResponse({
      status: 'ok',
      message: 'Bikehouse Lein Worker is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return jsonResponse({ error: 'Health check failed' }, 500);
  }
}

/**
 * GET /api/availability?date=YYYY-MM-DD
 * Get available 30-minute booking slots for a specific date
 */
async function handleAvailability(request, env) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date || !isValidDate(date)) {
      return jsonResponse({ error: 'Invalid date format. Use YYYY-MM-DD.' }, 400);
    }

    // Parse service account and initialize APIs
    const serviceAccount = parseServiceAccount(env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new GoogleServiceAccountAuth(serviceAccount.client_email, serviceAccount.private_key);
    const calendar = new GoogleCalendarAPI(auth);

    // Generate 30-minute slots for the day (9:00-17:00)
    const { start, end, slots } = generateSlots(date);

    // Query Google Calendar for busy times
    const busy = await calendar.getFreeBusy(env.GOOGLE_CALENDAR_ID, start.toISOString(), end.toISOString());

    // Filter available slots (no conflicts with busy times)
    const availableTimes = slots
      .filter(slot => {
        const slotEnd = new Date(slot.getTime() + 30 * 60 * 1000);
        return !busy.some(item => {
          const busyStart = new Date(item.start);
          const busyEnd = new Date(item.end);
          return slot < busyEnd && slotEnd > busyStart;
        });
      })
      .map(slot => {
        const hours = String(slot.getHours()).padStart(2, '0');
        const minutes = String(slot.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      });

    return jsonResponse({
      date,
      availableTimes,
      total: availableTimes.length,
      message: availableTimes.length > 0 
        ? `${availableTimes.length} beschikbare sloten` 
        : 'Geen vrije tijdstippen beschikbaar',
    });
  } catch (error) {
    console.error('Availability error:', error);
    return jsonResponse({ error: 'Kon de beschikbaarheid niet controleren.' }, 500);
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
async function handleCreateBooking(request, env) {
  try {
    const body = await request.json();
    const { name, email, phone, service, date, time, description } = body;

    // Validate required fields
    const required = ['name', 'email', 'phone', 'service', 'date', 'time'];
    for (const field of required) {
      if (!body[field]) {
        return jsonResponse({ error: `Missing field: ${field}` }, 400);
      }
    }

    // Validate date and time formats
    if (!isValidDate(date) || !isValidTime(time)) {
      return jsonResponse({ error: 'Invalid date or time format.' }, 400);
    }

    // Initialize Google APIs
    const serviceAccount = parseServiceAccount(env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new GoogleServiceAccountAuth(serviceAccount.client_email, serviceAccount.private_key);
    const calendar = new GoogleCalendarAPI(auth);
    const sheets = new GoogleSheetsAPI(auth);

    // Parse event times
    const eventStart = parseDateTime(date, time);
    const eventEnd = new Date(eventStart.getTime() + 30 * 60 * 1000);

    // Double-check: verify slot is still available
    const busy = await calendar.getFreeBusy(env.GOOGLE_CALENDAR_ID, eventStart.toISOString(), eventEnd.toISOString());
    const hasConflict = busy.some(item => {
      const busyStart = new Date(item.start);
      const busyEnd = new Date(item.end);
      return eventStart < busyEnd && eventEnd > busyStart;
    });

    if (hasConflict) {
      return jsonResponse({ error: 'Dit tijdslot is niet meer beschikbaar.' }, 409);
    }

    // Create calendar event
    const eventId = await calendar.createEvent(env.GOOGLE_CALENDAR_ID, {
      summary: `Boeking: ${name} - ${service}`,
      description: [
        `Naam: ${name}`,
        `Email: ${email}`,
        `Telefoon: ${phone}`,
        `Service: ${service}`,
        description ? `Beschrijving: ${description}` : '',
      ].filter(Boolean).join('\n'),
      start: {
        dateTime: eventStart.toISOString(),
        timeZone: 'Europe/Brussels',
      },
      end: {
        dateTime: eventEnd.toISOString(),
        timeZone: 'Europe/Brussels',
      },
      attendees: [{ email }],
    });

    // Append to spreadsheet
    await sheets.ensureSheet(env.GOOGLE_SPREADSHEET_ID, 'Boekingen');
    await sheets.appendRow(env.GOOGLE_SPREADSHEET_ID, 'Boekingen!A:I', [[
      new Date().toISOString(),
      name,
      email,
      phone,
      service,
      date,
      time,
      description || '',
      `https://calendar.google.com/calendar/r/eventedit/${eventId}`,
    ]]);

    return jsonResponse({
      success: true,
      message: 'Afspraak succesvol aangemaakt.',
      eventId,
    }, 201);
  } catch (error) {
    console.error('Booking creation failed:', error);
    return jsonResponse({ error: 'Er is iets misgegaan bij het aanmaken van de afspraak.' }, 500);
  }
}

/**
 * GET /api/bookings
 * List all bookings from spreadsheet
 */
async function handleGetBookings(request, env) {
  try {
    const serviceAccount = parseServiceAccount(env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new GoogleServiceAccountAuth(serviceAccount.client_email, serviceAccount.private_key);
    const sheets = new GoogleSheetsAPI(auth);
    const data = await sheets.getRange(env.GOOGLE_SPREADSHEET_ID, 'Boekingen!A:I');

    const rows = data.values || [];
    const bookings = rows.slice(1).map(row => ({
      timestamp: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
      service: row[4] || '',
      date: row[5] || '',
      time: row[6] || '',
      description: row[7] || '',
      calendarLink: row[8] || '',
    }));

    return jsonResponse({ total: bookings.length, bookings });
  } catch (error) {
    console.error('List bookings failed:', error);
    return jsonResponse({ error: 'Kon boekingen niet ophalen.' }, 500);
  }
}

/**
 * Main Worker request handler
 */
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    const url = new URL(request.url);

    // Route requests to appropriate handlers
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return handleHealth(request, env);
    }

    if (url.pathname === '/api/availability' && request.method === 'GET') {
      return handleAvailability(request, env);
    }

    if (url.pathname === '/api/bookings' && request.method === 'POST') {
      return handleCreateBooking(request, env);
    }

    if (url.pathname === '/api/bookings' && request.method === 'GET') {
      return handleGetBookings(request, env);
    }

    // 404 Not Found
    return jsonResponse({ error: 'Endpoint not found' }, 404);
  },
};
