# Bikehouse Lein - Cloudflare Worker Setup Guide

## Architecture

```
Cloudflare Pages (Frontend)
        ↓
Cloudflare Worker (API)
        ↓
Google Calendar API + Google Sheets API
```

## Prerequisites

- Cloudflare account with Pages and Workers enabled
- Google Service Account credentials
- Google Calendar with ID: `bbdca37ce7bdbad2ee62e11ff7e731aad049a467c44a381b525ba4b1b2e301ae@group.calendar.google.com`
- Google Spreadsheet with ID: `1Zqxvanvz5iaHi_G52RMuQGX4RQRcYBj5`
- Service Account email: `bikehouselein-bookings@vocal-wavelet-510409-p3.iam.gserviceaccount.com`

## Setup Instructions

### 1. Get Your Service Account Private Key

Go to Google Cloud Console:
1. Navigate to **IAM & Admin** → **Service Accounts**
2. Select `bikehouselein-bookings@vocal-wavelet-510409-p3.iam.gserviceaccount.com`
3. Click **Keys** tab
4. Click **Create New Key** → **JSON**
5. A JSON file will be downloaded with your private key

The private key looks like:
```json
{
  "type": "service_account",
  "project_id": "vocal-wavelet-510409-p3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "bikehouselein-bookings@vocal-wavelet-510409-p3.iam.gserviceaccount.com",
  ...
}
```

### 2. Deploy to Cloudflare Workers

#### Option A: Using Wrangler CLI (Recommended)

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create a new KV namespace for development
wrangler kv:namespace create BOOKINGS_KV
wrangler kv:namespace create BOOKINGS_KV --preview

# Set environment variables in wrangler.toml or use secrets
wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
# Paste: bikehouselein-bookings@vocal-wavelet-510409-p3.iam.gserviceaccount.com

wrangler secret put GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
# Paste the ENTIRE private_key value from the JSON file (including -----BEGIN/END-----)

wrangler secret put GOOGLE_CALENDAR_ID
# Paste: bbdca37ce7bdbad2ee62e11ff7e731aad049a467c44a381b525ba4b1b2e301ae@group.calendar.google.com

wrangler secret put GOOGLE_SPREADSHEET_ID
# Paste: 1Zqxvanvz5iaHi_G52RMuQGX4RQRcYBj5

# Deploy to production
npm run worker:deploy
```

#### Option B: Using Cloudflare Dashboard

1. Go to **Workers & Pages** → **Create Application** → **Write your own** → **Worker**
2. Copy the content from `src/worker.js` into the worker editor
3. Copy `src/google-auth.js`, `src/google-calendar.js`, `src/google-sheets.js` and import them at the top
4. In the **Settings** tab, add these environment variables under **Secrets**:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
   - `GOOGLE_SPREADSHEET_ID`

### 3. Get Your Worker URL

After deployment, your worker will have a URL like:
```
https://bikehouse-bookings.your-account.workers.dev
```

### 4. Update Frontend Configuration

In `public/script.js`, update the API endpoint:
```javascript
const API_BASE_URL = 'https://bikehouse-bookings.your-account.workers.dev';
```

### 5. Deploy Website to Cloudflare Pages

```bash
# Install Wrangler if not already done
npm install -g wrangler

# Create a Pages project
wrangler pages project create fietsherstel-website

# Or deploy using GitHub integration:
# 1. Push to GitHub
# 2. Connect repo to Cloudflare Pages
# 3. Set build command: (leave empty for static)
# 4. Set build output directory: public
```

### 6. Connect to Custom Domain (Optional)

1. In Cloudflare Dashboard → **Websites** → Your domain
2. Set up DNS records pointing to Pages
3. Set up Worker routes to handle API calls

## Booking Flow

1. **User selects date** in booking form
2. **Frontend calls** `/api/availability?date=YYYY-MM-DD`
3. **Worker queries** Google Calendar Free/Busy API
4. **Worker returns** available 30-minute slots
5. **User selects time & submits form**
6. **Worker verifies** slot is still available
7. **If available:**
   - Creates event in Google Calendar
   - Appends row to Google Sheets
   - Returns success message
8. **If not available:**
   - Returns 409 Conflict error
   - User must choose different time

## API Endpoints

### GET /api/availability
Query available booking slots for a date.

**Request:**
```
GET https://your-worker.workers.dev/api/availability?date=2024-12-25
```

**Response:**
```json
{
  "date": "2024-12-25",
  "availableTimes": ["09:00", "09:30", "10:00", ...],
  "message": "12 beschikbare sloten"
}
```

### POST /api/bookings
Create a new booking.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+32123456789",
  "service": "groot",
  "date": "2024-12-25",
  "time": "10:00",
  "description": "Flat tire repair"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Afspraak succesvol aangemaakt!",
  "eventId": "abc123"
}
```

**Response (Conflict):**
```json
{
  "error": "Dit tijdslot is niet meer beschikbaar."
}
```

## Environment Variables Reference

```bash
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=bikehouselein-bookings@vocal-wavelet-510409-p3.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Google Calendar & Sheets
GOOGLE_CALENDAR_ID=bbdca37ce7bdbad2ee62e11ff7e731aad049a467c44a381b525ba4b1b2e301ae@group.calendar.google.com
GOOGLE_SPREADSHEET_ID=1Zqxvanvz5iaHi_G52RMuQGX4RQRcYBj5

# Booking Configuration
BOOKING_DURATION_MINUTES=30
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=17:00
```

## Google Cloud IAM Setup

Ensure your Service Account has these permissions:

1. **Google Calendar API:**
   - `calendar.calendars.readonly`
   - `calendar.events.create`
   - `calendar.freebusy.query`

2. **Google Sheets API:**
   - `spreadsheets.readonly`
   - `spreadsheets.values.append`

Grant these via IAM → Service Accounts → your account → Roles

## Troubleshooting

### "Invalid private key"
- Make sure you copied the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- In Cloudflare secrets, the key should be a single line with `\n` as newline markers

### "Calendar not found"
- Verify the calendar ID is correct
- Ensure the Service Account email has access to the calendar

### "Spreadsheet not found"
- Verify the spreadsheet ID is correct
- Share the spreadsheet with the Service Account email

### Workers returning 403 errors
- Check that secrets are set correctly
- Verify Service Account has required IAM roles
- Check Cloudflare Worker logs in dashboard

## Testing Locally

```bash
# Start local worker
npm run worker:dev

# Test availability endpoint
curl "http://localhost:8787/api/availability?date=2024-12-25"

# Test booking
curl -X POST http://localhost:8787/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "phone": "+32123456789",
    "service": "groot",
    "date": "2024-12-25",
    "time": "10:00",
    "description": "Test booking"
  }'
```

## Security Best Practices

1. ✅ **No OAuth Client ID/Secret** - Using Service Account JWT only
2. ✅ **Private key in secrets** - Never commit to git
3. ✅ **CORS enabled** - Adjust origin if needed
4. ✅ **Input validation** - Date format, required fields
5. ✅ **Double-check availability** - Verify slot before creating event
6. ⚠️ **Rate limiting** - Consider adding for production
7. ⚠️ **Logging** - Monitor Worker logs for errors

## Cost Considerations

- Cloudflare Workers: 100,000 requests/day free
- Google Calendar API: Unlimited (requires service account)
- Google Sheets API: Unlimited (requires service account)

## Support & Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
