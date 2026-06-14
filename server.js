const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint voor afspraken
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, service, date, time, description } = req.body;

    // Validatie
    if (!name || !email || !phone || !service || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alle verplichte velden moeten worden ingevuld' 
      });
    }

    // Hier kun je later:
    // 1. De afspraak opslaan in een database
    // 2. Email versturen via SendGrid
    // 3. Google Calendar event aanmaken
    // 4. Admin email versturen

    console.log('Nieuwe afspraak:', { name, email, phone, service, date, time, description });

    // Placeholder response
    res.json({ 
      success: true, 
      message: 'Afspraak ontvangen! We nemen binnenkort contact met u op.' 
    });

  } catch (error) {
    console.error('Fout bij afspraakaanvraag:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Er is een fout opgetreden. Probeer het later opnieuw.' 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚲 Fietsherstel website draait op http://localhost:${PORT}`);
});
