const API_URL = window.location.origin;

        
                 // Fetch and display artists from backend
async function loadArtists() {
  try {
    const response = await fetch(`${API_URL}/api/artists`);
    if (!response.ok) throw new Error('Failed to fetch artists');
    
    const artists = await response.json();
    const container = document.getElementById('artistsContainer');
    
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render each artist
    artists.forEach(artist => {
      const artistCard = document.createElement('div');
      artistCard.className = 'artist-card';
      artistCard.setAttribute('data-specialty', artist.specialty?.toLowerCase() || 'general');
      artistCard.setAttribute('data-rating', artist.rating || 0);
      artistCard.setAttribute('data-followers', artist.followers || 0);
      
      artistCard.innerHTML = `
        <img src="${artist.image || 'https://via.placeholder.com/300'}" 
             alt="${artist.name}" 
             class="artist-image"
             onerror="this.src='https://via.placeholder.com/300'">
        <h2 class="artist-name">${artist.name}</h2>
        <p class="artist-desc">${artist.bio || 'No bio available'}</p>
        <div class="artist-stats">
          <span>⭐ ${artist.rating || 0} Rating</span>
          <span>👥 ${artist.followers || 0} Followers</span>
        </div>
        <button class="btn profile-btn" onclick="viewArtistProfile(${artist.id})">View Profile</button>
      `;
      
      container.appendChild(artistCard);
    });
    
    // Initialize filters after loading
    if (typeof filterArtists === 'function') {
      filterArtists();
    }
  } catch (error) {
    console.error('Error loading artists:', error);
    const container = document.getElementById('artistsContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p style="color: #8c6b3f; font-size: 1.1rem;">
            Unable to load artists. Please make sure the backend server is running.
          </p>
        </div>
      `;
    }
  }
}

function viewArtistProfile(artistId) {
  alert(`Viewing artist profile #${artistId}`);
  // You can add navigation logic here
}

// Load artists when page loads
loadArtists();

        document.addEventListener('DOMContentLoaded', function() {
            // Mobile menu toggle
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const mainNav = document.querySelector('.main-nav');
            
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', function() {
                    mainNav.classList.toggle('active');
                    this.querySelector('i').classList.toggle('fa-bars');
                    this.querySelector('i').classList.toggle('fa-times');
                });
            }
            
            // Multi-select filter functionality
            const specialtiesButton = document.getElementById('specialtiesButton');
            const specialtiesOptions = document.getElementById('specialtiesOptions');
            const specialtyCheckboxes = specialtiesOptions.querySelectorAll('input[type="checkbox"]');
            
            specialtiesButton.addEventListener('click', function() {
                specialtiesOptions.classList.toggle('active');
                this.querySelector('i').classList.toggle('fa-chevron-down');
                this.querySelector('i').classList.toggle('fa-chevron-up');
            });
            
            // Close multi-select when clicking outside
            document.addEventListener('click', function(e) {
                if (!specialtiesButton.contains(e.target) && !specialtiesOptions.contains(e.target)) {
                    specialtiesOptions.classList.remove('active');
                    specialtiesButton.querySelector('i').classList.add('fa-chevron-down');
                    specialtiesButton.querySelector('i').classList.remove('fa-chevron-up');
                }
            });
            
            // Filter functionality
            const artistSearch = document.getElementById('artistSearch');
            const sortFilter = document.getElementById('sortFilter');
            const artistCount = document.getElementById('artistCount');
            const artistsContainer = document.getElementById('artistsContainer');
            const artistCards = document.querySelectorAll('.artist-card');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const noResults = document.getElementById('noResults');
            const paginationContainer = document.getElementById('pagination');
            
            // Pagination variables
            const artistsPerPage = 6;
            let currentPage = 1;
            
            function filterArtists() {
                loadingIndicator.classList.add('active');
                
                // Simulate loading for better UX
                setTimeout(() => {
                    const searchValue = artistSearch.value.toLowerCase();
                    const sortValue = sortFilter.value;
                    
                    // Get selected specialties
                    const selectedSpecialties = [];
                    specialtyCheckboxes.forEach(checkbox => {
                        if (checkbox.checked) {
                            selectedSpecialties.push(checkbox.value);
                        }
                    });
                    
                    let visibleCount = 0;
                    let artists = [];
                    
                    // First filter by search and specialty
                    artistCards.forEach(card => {
                        const name = card.querySelector('.artist-name').textContent.toLowerCase();
                        const desc = card.querySelector('.artist-desc').textContent.toLowerCase();
                        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
                        const specialty = card.getAttribute('data-specialty');
                        
                        const matchesSearch = name.includes(searchValue) || desc.includes(searchValue) || 
                                            tags.some(tag => tag.includes(searchValue));
                        const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.includes(specialty);
                        
                        if (matchesSearch && matchesSpecialty) {
                            card.style.display = 'flex';
                            visibleCount++;
                            
                            // Collect artist data for sorting
                            artists.push({
                                element: card,
                                name: name,
                                rating: parseFloat(card.getAttribute('data-rating')),
                                followers: parseInt(card.getAttribute('data-followers'))
                            });
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    // Show no results message if needed
                    if (visibleCount === 0) {
                        noResults.classList.add('active');
                    } else {
                        noResults.classList.remove('active');
                    }
                    
                    // Sort artists
                    if (sortValue === 'name') {
                        artists.sort((a, b) => a.name.localeCompare(b.name));
                    } else if (sortValue === 'rating') {
                        artists.sort((a, b) => b.rating - a.rating);
                    } else if (sortValue === 'followers') {
                        artists.sort((a, b) => b.followers - a.followers);
                    }
                    
                    // Reorder artists in DOM
                    artists.forEach(artist => {
                        artistsContainer.appendChild(artist.element);
                    });
                    
                    // Update count
                    artistCount.textContent = visibleCount;
                    
                    // Setup pagination
                    setupPagination(visibleCount);
                    
                    // Show appropriate page
                    showPage(currentPage);
                    
                    loadingIndicator.classList.remove('active');
                }, 500); // Simulate 500ms loading time
            }
            
            // Pagination functions
            function setupPagination(totalArtists) {
                paginationContainer.innerHTML = '';
                const pageCount = Math.ceil(totalArtists / artistsPerPage);
                
                if (pageCount <= 1) {
                    paginationContainer.style.display = 'none';
                    return;
                }
                
                paginationContainer.style.display = 'flex';
                
                for (let i = 1; i <= pageCount; i++) {
                    const button = document.createElement('button');
                    button.innerText = i;
                    button.classList.add('pagination-btn');
                    if (i === currentPage) button.classList.add('active');
                    
                    button.addEventListener('click', () => {
                        currentPage = i;
                        showPage(currentPage);
                        
                        // Update active state
                        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        button.classList.add('active');
                        
                        // Scroll to top of artists section
                        artistsContainer.scrollIntoView({ behavior: 'smooth' });
                    });
                    
                    paginationContainer.appendChild(button);
                }
            }
            
            function showPage(page) {
                const startIndex = (page - 1) * artistsPerPage;
                const endIndex = startIndex + artistsPerPage;
                let visibleIndex = 0;
                
                artistCards.forEach(card => {
                    if (card.style.display !== 'none') {
                        if (visibleIndex >= startIndex && visibleIndex < endIndex) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                        visibleIndex++;
                    }
                });
            }
            
            // Add event listeners for filtering
            artistSearch.addEventListener('input', () => {
                currentPage = 1;
                filterArtists();
            });
            
            sortFilter.addEventListener('change', () => {
                currentPage = 1;
                filterArtists();
            });
            
            specialtyCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    currentPage = 1;
                    filterArtists();
                });
            });
            
            // Artist modal functionality
            const artistModal = document.getElementById('artistModal');
            const modalClose = document.getElementById('modalClose');
            const modalImage = document.getElementById('modalImage');
            const modalName = document.getElementById('modalName');
            const modalStats = document.getElementById('modalStats');
            const modalBio = document.getElementById('modalBio');
            const modalTags = document.getElementById('modalTags');
            const modalArtworks = document.getElementById('modalArtworks');
            const profileButtons = document.querySelectorAll('.profile-btn');
            
            // Lightbox functionality
            const lightbox = document.getElementById('lightbox');
            const lightboxClose = document.getElementById('lightboxClose');
            const lightboxImage = document.getElementById('lightboxImage');
            
            // Toast notification
            const toast = document.getElementById('toast');
            
            function showToast(message) {
                toast.textContent = message;
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
            
            // Artist data for modal
            const artistData = {
                anya: {
                    name: "Anya Sharma",
                    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    rating: 4.9,
                    followers: 12500,
                    bio: "Anya is a visionary artist who transforms discarded plastic into vibrant, intricate sculptures. With over 10 years of experience, she has developed unique techniques to melt, mold, and shape plastic waste into beautiful artworks that highlight both the problem of plastic pollution and the beauty that can be found in unexpected places. Her work has been exhibited in galleries across the country and has been featured in several environmental publications.",
                    tags: ["Recycled plastic sculptures", "Upcycled household items", "Plastic bottle art", "Environmental installations"],
                    artworks: [
                        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1549056572-75914d6d7e1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    ]
                },
                ben: {
                    name: "Ben Carter",
                    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    rating: 4.7,
                    followers: 8700,
                    bio: "Ben specializes in textile upcycling, creating stunning tapestries and wearable art from fabric scraps and discarded clothing. His work challenges fast fashion conventions and promotes sustainable practices in the textile industry. With a background in fashion design, Ben brings technical expertise and artistic vision to every piece he creates.",
                    tags: ["Textile upcycling", "Fabric collage", "Woven art", "Sustainable fashion"],
                    artworks: [
                        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1516633630673-67bbad747022?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    ]
                },
                clara: {
                    name: "Clara Rodriguez",
                    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    rating: 4.8,
                    followers: 15300,
                    bio: "Clara specializes in large-scale metal sculptures and installations using reclaimed industrial materials. Her work explores themes of transformation and resilience, giving new life to discarded metal objects. With a background in welding and metalworking, she creates powerful pieces that comment on consumerism and waste.",
                    tags: ["Metal sculpture", "Industrial waste art", "Found object assemblage", "Public installations"],
                    artworks: [
                        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1549056572-75914d6d7e1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    ]
                },
                david: {
                    name: "David Lee",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    rating: 4.6,
                    followers: 6200,
                    bio: "David crafts delicate paper sculptures and collages from recycled paper, magazines, and cardboard. His intricate work showcases the versatility of paper as an artistic medium while promoting sustainability. Each piece tells a story of transformation from discarded material to cherished artwork.",
                    tags: ["Paper art", "Cardboard sculpture", "Recycled paper collage", "Mixed media"],
                    artworks: [
                        "https://images.unsplash.com/photo-1580637250481-b78db3e6f84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    ]
                },
                emily: {
                    name: "Emily Chen",
                    image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    rating: 4.9,
                    followers: 10100,
                    bio: "Emily repurposes e-waste components into futuristic and thought-provoking art pieces. Her work highlights technology's environmental impact while demonstrating the aesthetic potential of discarded electronics. She holds a degree in both fine arts and environmental science.",
                    tags: ["E-waste art", "Circuit board mosaics", "Recycled electronics", "Technology commentary"],
                    artworks: [
                        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    ]
                },
                frank: {
                    name: "Frank Green",
                    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db1604?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    rating: 4.5,
                    followers: 4500,
                    bio: "Frank focuses on ephemeral art using organic waste like dried leaves, seeds, and food scraps. His work explores nature's transient beauty and the cycle of growth and decay. Each piece is intentionally temporary, documenting the process through photography before returning to the earth.",
                    tags: ["Organic waste art", "Natural material sculpture", "Ephemeral installations", "Environmental art"],
                    artworks: [
                        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    ]
                }
            };
            
            // Open modal when profile button is clicked
            profileButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const artistId = this.getAttribute('data-artist');
                    const artist = artistData[artistId];
                    
                    if (artist) {
                        modalImage.src = artist.image;
                        modalImage.alt = artist.name;
                        modalName.textContent = artist.name;
                        
                        modalStats.innerHTML = `
                            <span>⭐ ${artist.rating} Rating</span>
                            <span>👥 ${artist.followers.toLocaleString()} Followers</span>
                        `;
                        
                        modalBio.textContent = artist.bio;
                        
                        modalTags.innerHTML = '';
                        artist.tags.forEach(tag => {
                            const tagElement = document.createElement('span');
                            tagElement.className = 'tag';
                            tagElement.textContent = tag;
                            modalTags.appendChild(tagElement);
                        });
                        
                        modalArtworks.innerHTML = '';
                        artist.artworks.forEach(artwork => {
                            const img = document.createElement('img');
                            img.src = artwork;
                            img.alt = "Artwork by " + artist.name;
                            img.className = 'artwork-thumb';
                            img.addEventListener('click', () => {
                                lightboxImage.src = artwork;
                                lightboxImage.alt = "Artwork by " + artist.name;
                                lightbox.classList.add('active');
                                document.body.style.overflow = 'hidden';
                            });
                            modalArtworks.appendChild(img);
                        });
                        
                        artistModal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            });
            
            // Close modal
            modalClose.addEventListener('click', function() {
                artistModal.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            // Close modal when clicking outside
            artistModal.addEventListener('click', function(e) {
                if (e.target === artistModal) {
                    artistModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Close lightbox
            lightboxClose.addEventListener('click', function() {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            // Close lightbox when clicking outside
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Contact button functionality
            document.querySelectorAll('.contact-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const artistName = this.closest('.artist-card').querySelector('.artist-name').textContent;
                    showToast(`Contact request sent to ${artistName}! They will respond within 48 hours.`);
                });
            });
            
            // Join button functionality
            document.getElementById('ctaJoinBtn').addEventListener('click', function() {
                showToast("Thank you for your interest! Our team will contact you shortly.");
            });
            
            // Animate cards on scroll
            function animateOnScroll() {
                const cards = document.querySelectorAll('.artist-card');
                cards.forEach(card => {
                    const cardTop = card.getBoundingClientRect().top;
                    const windowHeight = window.innerHeight;
                    
                    if (cardTop < windowHeight * 0.85) {
                        card.classList.add('visible');
                    }
                });
            }
            
            window.addEventListener('scroll', animateOnScroll);
            // Initial check on page load
            animateOnScroll();
            
            // Initialize filtering
            filterArtists();
        });

        // Add this at the beginning of your existing script section
(async function loadArtistsFromBackend() {
  try {
    const response = await fetch(`${API_URL}/api/artists/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const artists = await response.json();
    const container = document.getElementById('artistsContainer');
    
    if (!container || artists.length === 0) return;
    
    // Clear existing hardcoded artists
    container.innerHTML = '';
    
    // Render artists from backend
    artists.forEach(artist => {
      const artistCard = document.createElement('div');
      artistCard.className = 'artist-card';
      artistCard.setAttribute('data-specialty', (artist.specialty || 'general').toLowerCase());
      artistCard.setAttribute('data-rating', artist.rating || 0);
      artistCard.setAttribute('data-followers', artist.followers || 0);
      
      artistCard.innerHTML = `
        <img src="${artist.image || 'https://via.placeholder.com/300'}" 
             alt="${artist.name}" 
             class="artist-image"
             onerror="this.src='https://via.placeholder.com/300'">
        <h2 class="artist-name">${artist.name}</h2>
        <p class="artist-desc">${artist.bio || 'No bio available'}</p>
        <div class="artist-stats">
          <span>⭐ ${artist.rating || 0} Rating</span>
          <span>👥 ${artist.followers || 0} Followers</span>
        </div>
        <button class="btn profile-btn" onclick="alert('Artist Profile #${artist.id}')">View Profile</button>
      `;
      
      container.appendChild(artistCard);
    });
    
  } catch (error) {
    console.error('Error loading artists:', error);
  }
})();

    