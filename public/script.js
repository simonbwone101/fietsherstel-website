// Form handling
const bookingForm = document.getElementById('bookingForm');
const formMessage = document.getElementById('formMessage');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');

// Production Worker URL. If Cloudflare custom domain is not yet live,
// replace this with your workers.dev URL (for example: https://bikehouse-bookings.<account-id>.workers.dev)
const API_BASE_URL = 'https://api.bikehouselein.com';

function setTimeOptions(times = []) {
  if (!timeSelect) {
    return;
  }

  if (!times.length) {
    timeSelect.innerHTML = '<option value="">Geen vrije tijden beschikbaar</option>';
    timeSelect.disabled = true;
    return;
  }

  timeSelect.disabled = false;
  timeSelect.innerHTML = '<option value="">-- Selecteer een tijd --</option>' +
    times.map((time) => `<option value="${time}">${time}</option>`).join('');
}

async function loadAvailableTimes() {
  if (!dateInput || !timeSelect) {
    return;
  }

  const selectedDate = dateInput.value;
  if (!selectedDate) {
    setTimeOptions([]);
    return;
  }

  try {
    // Disable select while loading
    timeSelect.disabled = true;
    timeSelect.innerHTML = '<option value="">Laden...</option>';

    const response = await fetch(`${API_BASE_URL}/api/availability?date=${encodeURIComponent(selectedDate)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Kon de beschikbare tijden niet laden.');
    }

    setTimeOptions(data.availableTimes || []);
  } catch (error) {
    console.error('Availability error:', error);
    setTimeOptions([]);
    if (formMessage) {
      formMessage.classList.remove('success');
      formMessage.classList.add('error');
      formMessage.textContent = 'Kon de beschikbare tijdstippen niet laden. Probeer het later opnieuw.';
    }
  }
}

if (dateInput) {
  dateInput.addEventListener('change', loadAvailableTimes);
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      service: document.getElementById('service').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      description: document.getElementById('description').value
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      formMessage.classList.remove('error');
      formMessage.classList.add(data.success ? 'success' : 'error');
      formMessage.textContent = data.message || data.error;

      if (data.success) {
        setTimeout(() => {
          bookingForm.reset();
          setTimeOptions([]);
          formMessage.classList.remove('success');
          formMessage.textContent = '';
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      formMessage.classList.remove('success');
      formMessage.classList.add('error');
      formMessage.textContent = 'Er is een fout opgetreden. Probeer het later opnieuw.';
    }
  });
}

// Smooth scrolling voor navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Mobile menu toggle
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu) {
      navMenu.classList.remove('active');
    }
  });
});

console.log('🚲 Fietsherstel website geladen!');
