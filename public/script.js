// Form handling
const bookingForm = document.getElementById('bookingForm');
const formMessage = document.getElementById('formMessage');

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Form data verzamelen
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
      // API call naar backend
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Toon berichten
      formMessage.classList.remove('error');
      formMessage.classList.add(data.success ? 'success' : 'error');
      formMessage.textContent = data.message;

      if (data.success) {
        // Reset formulier na 2 seconden
        setTimeout(() => {
          bookingForm.reset();
          formMessage.classList.remove('success');
        }, 2000);
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

// Mobile menu toggle (voeg dit toe als je een hamburger menu wilt)
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Sluit menu na klik (voeg dit toe als je hamburger menu hebt)
    navMenu.classList.remove('active');
  });
});

console.log('🚲 Fietsherstel website geladen!');
