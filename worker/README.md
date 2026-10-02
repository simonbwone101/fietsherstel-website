# Bikehouse Lein - Cloudflare Worker Booking System

Cloudflare Worker setup voor het bookingsysteem van Bikehouse Lein.

## Structure

```
worker/                    # Aparte folder voor de Cloudflare Worker
├── src/
│   ├── worker.js         # Main handler
│   ├── google-auth.js    # Service Account JWT
│   ├── google-calendar.js # Calendar API
│   └── google-sheets.js  # Sheets API
├── package.json
├── wrangler.jsonc        # Cloudflare config
├── DEPLOYMENT.md         # Volledige setup guide
└── test-worker.js        # Test script
```

## Quick Start

```bash
cd worker
npm install
npm run dev
```

Zet dan in Cloudflare Dashboard de 3 secrets:
- GOOGLE_SERVICE_ACCOUNT
- GOOGLE_CALENDAR_ID
- GOOGLE_SPREADSHEET_ID

Dan deployen:
```bash
npm run deploy
```

## Endpoints

- `GET /api/health` - Status
- `GET /api/availability?date=YYYY-MM-DD` - Beschikbare slots
- `POST /api/bookings` - Boeking aanmaken
- `GET /api/bookings` - Alle boekingen

## Zie DEPLOYMENT.md voor complete instructies
