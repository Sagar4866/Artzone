const API_URL = window.location.origin;

        // Animation for art cards
        document.addEventListener('DOMContentLoaded', function() {
            const artCards = document.querySelectorAll('.art-card');
            
            artCards.forEach((card, index) => {
                // Apply animation with delay based on index
                card.style.animation = `fadeInUp 1s forwards ${0.3 + index * 0.2}s`;
            });
            
            // Add interactivity to category filters
            const categories = document.querySelectorAll('.category');
            categories.forEach(category => {
                category.addEventListener('click', function() {
                    categories.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    
                    // In a real application, this would filter the artwork
                    // For this example, we'll just simulate a slight delay
                    artCards.forEach(card => {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                        }, 300);
                    });
                });
            });
            
            // Add interactivity to like buttons
            const likeButtons = document.querySelectorAll('.icon-btn:first-child');
            likeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    this.classList.toggle('liked');
                    if (this.classList.contains('liked')) {
                        this.style.background = '#8d6e63';
                        this.style.color = 'white';
                    } else {
                        this.style.background = '#4e342e';
                        this.style.color = '#d7ccc8';
                    }
                });
            });
        });
    