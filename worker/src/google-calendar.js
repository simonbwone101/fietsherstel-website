/**
 * Google Calendar API Client
 * Handles FreeBusy checks and event creation using Service Account
 */

export class GoogleCalendarAPI {
  constructor(auth, tokenCache = new Map()) {
    this.auth = auth;
    this.baseUrl = 'https://www.googleapis.com/calendar/v3';
    this.tokenCache = tokenCache;
    this.scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
    ];
  }

  async getAccessToken() {
    const cacheKey = 'calendar_token';
    const cached = this.tokenCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.token;
    }

    const token = await this.auth.getAccessToken(this.scopes);
    this.tokenCache.set(cacheKey, {
      token,
      expiry: Date.now() + 50 * 60 * 1000,
    });

    return token;
  }

  /**
   * Check which times are busy in the calendar
   * @param {string} calendarId - Calendar ID to check
   * @param {string} timeMin - ISO timestamp start
   * @param {string} timeMax - ISO timestamp end
   * @returns {Array} Array of busy time slots
   */
  async getFreeBusy(calendarId, timeMin, timeMax) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/calendars/freeBusy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`FreeBusy lookup failed: ${errorBody.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.calendars?.[calendarId]?.busy || [];
  }

  /**
   * Create a new calendar event
   * @param {string} calendarId - Calendar ID
   * @param {Object} eventData - Event object with summary, description, start, end, attendees
   * @returns {string} Event ID
   */
  async createEvent(calendarId, eventData) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Create event failed: ${errorBody.error?.message || response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }
}
