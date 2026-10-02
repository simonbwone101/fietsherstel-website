# Cloudflare Worker Deployment Guide for Bikehouse Lein Bookings

## Wat je krijgt

De Cloudflare Worker bevat 4 endpoints:
- `GET /api/health` - Health check
- `GET /api/availability?date=YYYY-MM-DD` - Beschikbare sloten ophalen
- `POST /api/bookings` - Boeking aanmaken
- `GET /api/bookings` - Alle boekingen ophalen

De Worker is **volledig gescheiden** van je bestaande Cloudflare Pages website.

## Vereisten

1. **Google Service Account** (al klaar)
   - Email: bikehouselein-bookings@vocal-wavelet-510409-p3.iam.gserviceaccount.com
   - Private key (JSON format)

2. **Google Calendar ID**
   - bbdca37ce7bdbad2ee62e11ff7e731aad049a467c44a381b525ba4b1b2e301ae@group.calendar.google.com

3. **Google Spreadsheet ID**
   - 1Zqxvanvz5iaHi_G52RMuQGX4RQRcYBj5

4. **Cloudflare Account** (al klaar)
   - Workers & Pages enabled

## Stap 1: Lokaal installeren

```bash
cd worker
npm install
```

## Stap 2: Wrangler authenticatie

```bash
npx wrangler login
```

Dit zal je vragen om in te loggen bij Cloudflare.

Bij de eerste keer zal dit je naar een login-pagina sturen:
1. Accepteer de toestemming
2. Je krijgt een code
3. Plak die in terminal

## Stap 3: Cloudflare Secrets instellen

Nu moet je de secrets toevoegen. Je hebt twee opties:

### Optie A: Via Wrangler CLI

```bash
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT
# Plak hier de volledige JSON van je Google Service Account private key
# Druk Ctrl+D (of Cmd+D) als je klaar bent

npx wrangler secret put GOOGLE_CALENDAR_ID
# Plak: bbdca37ce7bdbad2ee62e11ff7e731aad049a467c44a381b525ba4b1b2e301ae@group.calendar.google.com

npx wrangler secret put GOOGLE_SPREADSHEET_ID
# Plak: 1Zqxvanvz5iaHi_G52RMuQGX4RQRcYBj5
```

### Optie B: Via Cloudflare Dashboard

1. Ga naar Cloudflare Dashboard
2. Workers & Pages → Create Service
3. Klik op je worker
4. Settings → Variables & Secrets
5. Voeg toe:
   - **GOOGLE_SERVICE_ACCOUNT**: volledige JSON
   - **GOOGLE_CALENDAR_ID**: bbdca37ce7bdbad2ee62e11ff7e731aad049a467c44a381b525ba4b1b2e301ae@group.calendar.google.com
   - **GOOGLE_SPREADSHEET_ID**: 1Zqxvanvz5iaHi_G52RMuQGX4RQRcYBj5

## Stap 4: Lokaal testen

```bash
npm run dev
```

Test in browser of terminal:

```bash
# Health check
curl http://localhost:8787/api/health

# Beschikbaarheid checken (vervang datum)
curl "http://localhost:8787/api/availability?date=2026-10-20"

# Boeking aanmaken
curl -X POST http://localhost:8787/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+32123456789",
    "service": "groot",
    "date": "2026-10-20",
    "time": "10:00",
    "description": "Test booking"
  }'
```

## Stap 5: Deployen naar Cloudflare

```bash
npm run deploy
```

Dit zal je worker deployen naar Cloudflare.

Na deployment krijg je een URL zoals:
```
https://bikehouse-bookings.<account-id>.workers.dev
```

## Stap 6: Secrets op production zetten

Als je secrets nog niet hebt ingesteld via Wrangler CLI, zet ze nu in Cloudflare Dashboard:
1. Cloudflare Dashboard
2. Workers & Pages
3. Click je worker "bikehouse-bookings"
4. Settings → Variables & Secrets
5. Voeg 3 secrets toe (zie Stap 3)

## Stap 7: Live testen

Test je live worker URL:

```bash
# Health check
curl https://bikehouse-bookings.<account-id>.workers.dev/api/health

# Beschikbaarheid
curl "https://bikehouse-bookings.<account-id>.workers.dev/api/availability?date=2026-10-20"

# Boeking
curl -X POST https://bikehouse-bookings.<account-id>.workers.dev/api/bookings \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Stap 8: Frontend bijwerken

Open `public/script.js` in je main website repo en update:

```javascript
const API_BASE_URL = 'https://bikehouse-bookings.<account-id>.workers.dev';
```

Replace `<account-id>` met je werkelijke Cloudflare account ID.

Of als je een custom domain hebt:

```javascript
const API_BASE_URL = 'https://api.bikehouselein.com';
```

## Custom Domain Setup (Optioneel)

Als je een custom domain wilt gebruiken (bijv. api.bikehouselein.com):

1. Update `wrangler.jsonc`:
   ```json
   "production": {
     "routes": [
       {
         "pattern": "api.bikehouselein.com/*",
         "zone_name": "bikehouselein.com"
       }
     ]
   }
   ```

2. Deploy naar production:
   ```bash
   npm run deploy
   ```

3. Update frontend naar `https://api.bikehouselein.com`

## Troubleshooting

### "Missing GOOGLE_SERVICE_ACCOUNT secret"
- Check dat je secrets in Cloudflare hebt gezet
- Zorg dat de secret names exact match (case-sensitive)

### "FreeBusy lookup failed"
- Verify Service Account heeft "Make changes to events" access op calendar
- Check dat Google Calendar API is enabled

### "Could not access spreadsheet"
- Verify Service Account is Editor op de spreadsheet
- Check dat Google Sheets API is enabled

### Worker URL is wrong
- Check `wrangler.jsonc` voor de juiste routes
- Controleer je Account ID in Cloudflare Dashboard

## API Endpoints

### GET /api/health
Status check

**Response:**
```json
{
  "status": "ok",
  "message": "Bikehouse Lein Worker is running",
  "timestamp": "2026-10-02T13:45:00Z"
}
```

### GET /api/availability?date=YYYY-MM-DD
Get available slots for a date

**Response:**
```json
{
  "date": "2026-10-20",
  "availableTimes": ["09:00", "09:30", "10:00", ...],
  "total": 10,
  "message": "10 beschikbare sloten"
}
```

### POST /api/bookings
Create a booking

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+32123456789",
  "service": "groot",
  "date": "2026-10-20",
  "time": "10:00",
  "description": "Flat tire"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Afspraak succesvol aangemaakt.",
  "eventId": "abc123"
}
```

**Response (Conflict):**
```json
{
  "error": "Dit tijdslot is niet meer beschikbaar."
}
```

### GET /api/bookings
Get all bookings

**Response:**
```json
{
  "total": 5,
  "bookings": [
    {
      "timestamp": "2026-10-02T13:45:00Z",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+32123456789",
      "service": "groot",
      "date": "2026-10-20",
      "time": "10:00",
      "description": "Flat tire",
      "calendarLink": "https://calendar.google.com/..."
    }
  ]
}
```

## File Structure

```
worker/
├── src/
│   ├── worker.js           # Main worker handler
│   ├── google-auth.js      # Service Account JWT auth
│   ├── google-calendar.js  # Calendar API client
│   └── google-sheets.js    # Sheets API client
├── package.json            # Dependencies
├── wrangler.jsonc          # Cloudflare config
└── DEPLOYMENT.md           # Dit bestand
```
