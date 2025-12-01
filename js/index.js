const API_URL = window.location.origin;

    // Reveal fade-in elements when scrolling
    document.addEventListener('DOMContentLoaded', function() {
      const observers = document.querySelectorAll('.fade-in, .fade-in.delay-1, .fade-in.delay-2, .fade-in.delay-3');
      
      observers.forEach(el => {
        function revealOnScroll() {
          if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
          }
        }
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll();
      });
      
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
      
      // Text reveal animation
      const textReveal = document.querySelector('.text-reveal');
      if (textReveal) {
        setTimeout(() => {
          textReveal.style.opacity = 1;
        }, 500);
      }
    });
  