const API_URL = window.location.origin;

    // Example JS: Fade in gallery cards on scroll, button animation
    document.querySelectorAll('.art-card').forEach(function(card, idx){
      card.style.opacity=0;
      setTimeout(function(){ card.style.opacity=1; }, 120+idx*90);
    });
    document.querySelectorAll('.action-buttons button, .action-buttons a').forEach(function(btn){
      btn.addEventListener('mousedown', function(){
        btn.style.transform='scale(0.96)';
      });
      btn.addEventListener('mouseup', function(){
        btn.style.transform='';
      });
    });
    // Simple text reveal animation
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.main-title-section h1').forEach((el) => {
        el.style.transition = "opacity 1.1s, letter-spacing 1s";
        el.style.opacity = "0";
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.letterSpacing = "0";
        }, 650);
      });
    });
  