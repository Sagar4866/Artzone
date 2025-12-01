  const API_URL = window.location.origin;

    // Initialize blog data
    document.addEventListener('DOMContentLoaded', function() {
      // Get all blog cards
      const blogCards = document.querySelectorAll('.blog-card');
      const totalArticles = blogCards.length;
      document.getElementById('article-count').textContent = `📄 ${totalArticles} articles`;
      
      // Set up search functionality
      const searchInput = document.getElementById('blog-search');
      const categoryFilter = document.getElementById('category-filter');
      const loadingIndicator = document.getElementById('loading-indicator');
      const noResultsMessage = document.getElementById('no-results');
      
      // Add event listeners for filtering
      searchInput.addEventListener('input', filterArticles);
      categoryFilter.addEventListener('change', filterArticles);
      
      // Filter articles based on search and category
      function filterArticles() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        
        // Show loading indicator
        loadingIndicator.classList.add('active');
        
        // Use setTimeout to allow the UI to update before the filtering operation
        setTimeout(() => {
          let visibleCount = 0;
          
          blogCards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const content = card.getAttribute('data-content').toLowerCase();
            const author = card.getAttribute('data-author').toLowerCase();
            const categories = card.getAttribute('data-categories');
            
            const matchesSearch = searchTerm === '' || 
                                title.includes(searchTerm) || 
                                content.includes(searchTerm) || 
                                author.includes(searchTerm);
            
            const matchesCategory = category === 'all' || categories.includes(category);
            
            if (matchesSearch && matchesCategory) {
              card.style.display = 'flex';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          });
          
          // Update article count
          document.getElementById('article-count').textContent = `📄 ${visibleCount} articles`;
          
          // Show/hide no results message
          if (visibleCount === 0) {
            noResultsMessage.classList.add('active');
          } else {
            noResultsMessage.classList.remove('active');
          }
          
          // Hide loading indicator
          loadingIndicator.classList.remove('active');
        }, 300); // Short delay to show loading indicator
      }
      
      // Simple animation for hero, cards, and section titles
      document.querySelectorAll('.section-title, .blog-card, .hero h1').forEach(el => {
        el.style.opacity = 0;
        setTimeout(() => {
          el.style.transition = "opacity .7s, transform .8s";
          el.style.opacity = 1;
          el.style.transform = "translateY(0)";
        }, 350);
      });
      
      // Button click animation
      document.querySelectorAll('.read-btn, .btn.subscribe-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          btn.style.transform = "scale(0.98)";
          setTimeout(() => btn.style.transform = "scale(1)", 210);
        });
      });
      
      // Subscribe form handling
      const subscribeBtn = document.querySelector('.subscribe-btn');
      const subscribeInput = document.querySelector('.subscribe-input');
      
      subscribeBtn.addEventListener('click', function() {
        if (subscribeInput.value && subscribeInput.value.includes('@')) {
          alert('Thanks for subscribing! You\'ll hear from us soon.');
          subscribeInput.value = '';
        } else {
          alert('Please enter a valid email address.');
        }
      });
    });

    // Load blogs from backend
(async function loadBlogs() {
  try {
   const response = await fetch(`${API_URL}/api/blogs`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const blogs = await response.json();
    const container = document.querySelector('.blog-grid') || document.querySelector('.blogs-container');
    
    if (!container || blogs.length === 0) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render blogs
    blogs.forEach(blog => {
      const blogCard = document.createElement('div');
      blogCard.className = 'blog-card';
      
      blogCard.innerHTML = `
        <img src="${blog.image || 'https://via.placeholder.com/400'}" 
             alt="${blog.title}"
             onerror="this.src='https://via.placeholder.com/400'">
        <div class="blog-info">
          <h3>${blog.title}</h3>
          <p class="blog-meta">By ${blog.author || 'Anonymous'} | ${blog.category || 'General'}</p>
          <p>${blog.content ? blog.content.substring(0, 150) + '...' : ''}</p>
          <button class="btn read-more" onclick="alert('Read blog #${blog.id}')">Read More</button>
        </div>
      `;
      
      container.appendChild(blogCard);
    });
    
  } catch (error) {
    console.error('Error loading blogs:', error);
  }
})();

  