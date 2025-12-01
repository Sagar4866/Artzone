const API_URL = window.location.origin;

    // Animate cards on scroll
    window.addEventListener('scroll', function() {
      document.querySelectorAll('.event-card').forEach(function(card) {
        const rect = card.getBoundingClientRect();
        if(rect.top < window.innerHeight - 80) {
          card.classList.add('anim-flipIn');
        }
      });
    });
    
    // Button ripple effect
    document.querySelectorAll('.btn').forEach(function(b) {
      b.addEventListener('click', function(e){
        const btn = e.currentTarget;
        btn.style.boxShadow = "0 0 0 8px #ead6b580";
        setTimeout(()=>{btn.style.boxShadow="";},350);
      });
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
      }
    });

    // Load events from backend
(async function loadEvents() {
  try {
    const response = await fetch(`${API_URL}/api/events`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const events = await response.json();
    const container = document.querySelector('.events-grid') || document.querySelector('.events-container');
    
    if (!container || events.length === 0) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render events
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      
      eventCard.innerHTML = `
        <img src="${event.image || 'https://via.placeholder.com/400'}" 
             alt="${event.title}"
             onerror="this.src='https://via.placeholder.com/400'">
        <div class="event-info">
          <h3>${event.title}</h3>
          <p>${event.description || ''}</p>
          <p class="event-date">📅 ${event.event_date || 'TBA'}</p>
          <p class="event-time">🕐 ${event.event_time || 'TBA'}</p>
          <p class="event-location">📍 ${event.location || 'TBA'}</p>
          <button class="btn register-btn" onclick="registerEvent(${event.id})">Register</button>
        </div>
      `;
      
      container.appendChild(eventCard);
    });
    
  } catch (error) {
    console.error('Error loading events:', error);
  }
})();

// Register for event
async function registerEvent(eventId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Please login first to register for events');
    window.location.href = 'login.html';
    return;
  }
  
  try {
 await fetch(`${API_URL}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      alert('Successfully registered for the event!');
    } else {
      const data = await response.json();
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Error registering:', error);
    alert('Error registering for event');
  }
}

  