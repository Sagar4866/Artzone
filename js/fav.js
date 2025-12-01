const API_URL = window.location.origin;

// Load favorites on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadFavorites();
});

// Load favorites from backend
async function loadFavorites() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showLoginMessage();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to load favorites');
        }

        const result = await response.json();
        const favorites = result.data || [];
        
        renderFavorites(favorites);

    } catch (error) {
        console.error('Error loading favorites:', error);
        showError('Failed to load favorites');
    }
}

// Add to favorites
async function addToFavorites(artworkId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Please login to add favorites');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/favorites/${artworkId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.message === 'Already in favorites') {
                showInfo('Already in favorites!');
                return;
            }
            throw new Error('Failed to add to favorites');
        }

        showSuccess('Added to favorites!');
        await loadFavorites();

    } catch (error) {
        console.error('Error adding to favorites:', error);
        showError('Failed to add to favorites');
    }
}

// Remove from favorites
async function removeFromFavorites(artworkId) {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/api/favorites/${artworkId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to remove from favorites');

        showSuccess('Removed from favorites');
        await loadFavorites();

    } catch (error) {
        console.error('Error removing from favorites:', error);
        showError('Failed to remove from favorites');
    }
}

// Toggle favorite (for heart button)
async function toggleFavorite(artworkId, heartButton) {
    const isFavorited = heartButton.classList.contains('favorited');
    
    if (isFavorited) {
        await removeFromFavorites(artworkId);
        heartButton.classList.remove('favorited');
        heartButton.textContent = '🤍';
    } else {
        await addToFavorites(artworkId);
        heartButton.classList.add('favorited');
        heartButton.textContent = '❤️';
    }
}

// Render favorites
function renderFavorites(favorites) {
    const favContainer = document.getElementById('favoritesList') || document.getElementById('gallery');
    
    if (!favContainer) return;

    if (favorites.length === 0) {
        favContainer.innerHTML = `
            <div class="favorites-empty">
                <h3>No favorites yet</h3>
                <p>Start exploring and click the ❤️ on artworks you love!</p>
                <a href="/gallery.html" class="btn">Browse Gallery</a>
            </div>
        `;
        return;
    }

    const html = favorites.map(artwork => `
        <div class="art-item" data-id="${artwork._id}">
            <div class="art-image">
                <img src="${artwork.images[0] || '/images/placeholder.jpg'}" alt="${artwork.title}">
                <button class="fav-btn favorited" onclick="toggleFavorite('${artwork._id}', this)">
                    ❤️
                </button>
            </div>
            <div class="art-details">
                <h3>${artwork.title}</h3>
                <p class="artist-name">${artwork.artist?.name || 'Unknown Artist'}</p>
                <p class="price">₹${artwork.price}</p>
                <div class="art-actions">
                    <button class="btn view-btn" onclick="viewArtwork('${artwork._id}')">View Details</button>
                    <button class="btn cart-btn" onclick="addToCart('${artwork._id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');

    favContainer.innerHTML = html;
}

// View artwork details
function viewArtwork(artworkId) {
    window.location.href = `/artwork-detail.html?id=${artworkId}`;
}

// Add to cart (calls cart.js function)
async function addToCart(artworkId) {
    // This will use the addToCart function from cart.js
    if (typeof window.addToCart === 'function') {
        window.addToCart(artworkId);
    } else {
        // Fallback if cart.js not loaded
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add to cart');
            window.location.href = '/login.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ artworkId, quantity: 1 })
            });

            if (response.ok) {
                showSuccess('Added to cart!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Helper functions
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showInfo(message) {
    const toast = document.createElement('div');
    toast.className = 'toast info';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showLoginMessage() {
    const favContainer = document.getElementById('favoritesList') || document.getElementById('gallery');
    if (favContainer) {
        favContainer.innerHTML = `
            <div class="favorites-empty">
                <h3>Please login to view favorites</h3>
                <a href="/login.html" class="btn">Login</a>
            </div>
        `;
    }
}

// Add event listeners for favorite buttons throughout the site
document.addEventListener('DOMContentLoaded', () => {
    // Add favorite button handlers on gallery/artwork pages
    document.querySelectorAll('.fav-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const artworkId = this.dataset.artworkId || 
                             this.closest('.art-item')?.dataset.id;
            if (artworkId) {
                toggleFavorite(artworkId, this);
            }
        });
    });
});
