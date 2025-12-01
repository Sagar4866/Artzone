const API_URL = window.location.origin;

    
    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Mobile menu toggle
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      const navLinks = document.querySelector('.nav-links');
      
      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
          navLinks.classList.toggle('active');
          this.querySelector('i').classList.toggle('fa-bars');
          this.querySelector('i').classList.toggle('fa-times');
        });
      }
      
      // Filter functionality
      const filterButtons = document.querySelectorAll('.filter-btn');
      const galleryCards = document.querySelectorAll('.gallery-card');
      
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons
          filterButtons.forEach(btn => btn.classList.remove('active'));
          
          // Add active class to clicked button
          button.classList.add('active');
          
          const filterValue = button.getAttribute('data-filter');
          
          // Filter cards
          galleryCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
              card.classList.add('visible');
            } else {
              card.classList.remove('visible');
            }
          });
        });
      });
      
      // Lightbox functionality
      const lightbox = document.getElementById('lightbox');
      const lightboxImage = document.getElementById('lightbox-image');
      const lightboxCaption = document.getElementById('lightbox-caption');
      const viewArtButtons = document.querySelectorAll('.view-art');
      const closeLightbox = document.querySelector('.lightbox-close');
      
      viewArtButtons.forEach(button => {
        button.addEventListener('click', () => {
          const imageUrl = button.getAttribute('data-image');
          const title = button.getAttribute('data-title');
          
          lightboxImage.src = imageUrl;
          lightboxCaption.textContent = title;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
      });
      
      closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Enable scrolling
      });
      
      // Close lightbox when clicking outside the image
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          lightbox.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
      
      // Animate cards on scroll
      const animateOnScroll = () => {
        galleryCards.forEach(card => {
          const cardPosition = card.getBoundingClientRect().top;
          const screenPosition = window.innerHeight / 1.3;
          
          if (cardPosition < screenPosition && card.classList.contains('visible')) {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
          }
        });
      };
      
      window.addEventListener('scroll', animateOnScroll);
      // Initial call to check visible elements on page load
      animateOnScroll();
      
      // Button Ripple Animation
      document.querySelectorAll('.gallery-btn').forEach(btn => {
        btn.addEventListener('click', function(e){
          btn.classList.add('active');
          setTimeout(() => btn.classList.remove('active'), 370);
        });
      });
    });

    // Load artworks from backend
(async function loadGallery() {
  try {
    const response = await fetch(`${API_URL}/api/artworks`)
    if (!response.ok) throw new Error('Failed to fetch');
    
    const artworks = await response.json();
    const container = document.querySelector('.gallery-grid') || document.querySelector('.gallery');
    
    if (!container || artworks.length === 0) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render artworks
    artworks.forEach(artwork => {
      const artworkCard = document.createElement('div');
      artworkCard.className = 'gallery-item';
      
      artworkCard.innerHTML = `
        <img src="${artwork.image || 'https://via.placeholder.com/400'}" 
             alt="${artwork.title}"
             onerror="this.src='https://via.placeholder.com/400'">
        <div class="artwork-info">
          <h3>${artwork.title}</h3>
          <p>${artwork.description || ''}</p>
          <p class="price">₹${artwork.price || 0}</p>
          <p class="materials">${artwork.materials || ''}</p>
        </div>
      `;
      
      container.appendChild(artworkCard);
    });
    
  } catch (error) {
    console.error('Error loading artworks:', error);
  }
})();

  