const API_URL = window.location.origin;

// Load cart on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCart();
    updateCartCount();
});

// Load cart from backend
async function loadCart() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showLoginMessage();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart`, {
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
            throw new Error('Failed to load cart');
        }

        const result = await response.json();
        const cartItems = result.data || [];
        
        renderCart(cartItems);
        updateCartCount();

    } catch (error) {
        console.error('Error loading cart:', error);
        showError('Failed to load cart');
    }
}

// Add artwork to cart
async function addToCart(artworkId, quantity = 1) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Please login to add items to cart');
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
            body: JSON.stringify({ artworkId, quantity })
        });

        if (!response.ok) throw new Error('Failed to add to cart');

        const result = await response.json();
        
        showSuccess('Added to cart!');
        await loadCart();
        updateCartCount();

    } catch (error) {
        console.error('Error adding to cart:', error);
        showError('Failed to add to cart');
    }
}

// Remove from cart
async function removeFromCart(artworkId) {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/api/cart/${artworkId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to remove from cart');

        showSuccess('Removed from cart');
        await loadCart();
        updateCartCount();

    } catch (error) {
        console.error('Error removing from cart:', error);
        showError('Failed to remove from cart');
    }
}

// Render cart items
function renderCart(cartItems) {
    const cartContainer = document.getElementById('cartItems');
    
    if (!cartContainer) return;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <h3>Your cart is empty</h3>
                <p>Browse our gallery to find amazing eco-art!</p>
                <a href="/gallery.html" class="btn">Browse Gallery</a>
            </div>
        `;
        return;
    }

    let total = 0;
    const html = cartItems.map(item => {
        const artwork = item.artwork;
        const subtotal = artwork.price * item.quantity;
        total += subtotal;

        return `
            <div class="cart-item" data-id="${artwork._id}">
                <img src="${artwork.images[0] || '/images/placeholder.jpg'}" alt="${artwork.title}">
                <div class="cart-item-details">
                    <h3>${artwork.title}</h3>
                    <p class="artist-name">${artwork.artist?.name || 'Unknown Artist'}</p>
                    <p class="price">₹${artwork.price}</p>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity('${artwork._id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${artwork._id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-subtotal">
                    ₹${subtotal}
                </div>
                <button class="remove-btn" onclick="removeFromCart('${artwork._id}')">
                    🗑️
                </button>
            </div>
        `;
    }).join('');

    cartContainer.innerHTML = html + `
        <div class="cart-total">
            <h3>Total: ₹${total}</h3>
            <button class="btn checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        </div>
    `;
}

// Update cart count badge
async function updateCartCount() {
    const token = localStorage.getItem('token');
    const cartBadge = document.querySelector('.nav-cart-count');
    
    if (!cartBadge || !token) return;

    try {
        const response = await fetch(`${API_URL}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const result = await response.json();
            const count = result.data?.length || 0;
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Update quantity
async function updateQuantity(artworkId, newQuantity) {
    if (newQuantity < 1) {
        await removeFromCart(artworkId);
        return;
    }

    await addToCart(artworkId, 1); // This will update the quantity
}

// Checkout
function checkout() {
    alert('Checkout functionality coming soon!');
    // Implement payment integration here
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

function showLoginMessage() {
    const cartContainer = document.getElementById('cartItems');
    if (cartContainer) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <h3>Please login to view your cart</h3>
                <a href="/login.html" class="btn">Login</a>
            </div>
        `;
    }
}

// Add event listeners for "Add to Cart" buttons throughout the site
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const artworkId = this.dataset.artworkId || this.dataset.id;
            if (artworkId) {
                addToCart(artworkId);
            }
        });
    });
});
