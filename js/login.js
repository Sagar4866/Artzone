const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const emailLoginForm = document.getElementById('emailLoginForm');
    const emailSignupForm = document.getElementById('emailSignupForm');

    // Tab switching
    if (loginTab && signupTab) {
        loginTab.addEventListener('click', function() {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            if (loginForm) loginForm.classList.add('active');
            if (signupForm) signupForm.classList.remove('active');
        });

        signupTab.addEventListener('click', function() {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            if (signupForm) signupForm.classList.add('active');
            if (loginForm) loginForm.classList.remove('active');
        });
    }

    // LOGIN FORM - Connect to backend
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            showLoading('Signing in...');

            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                hideLoading();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showMessage('Login successful! Welcome back.', 'success');
                    
                    setTimeout(() => {
                        window.location.href = '/index.html';
                    }, 1500);
                } else {
                    showMessage(data.message || 'Invalid credentials', 'error');
                }
            } catch (error) {
                hideLoading();
                showMessage('Connection error. Make sure backend is running.', 'error');
                console.error('Login error:', error);
            }
        });
    }

    // SIGNUP FORM - Connect to backend (Fixed!)
    if (emailSignupForm) {
        emailSignupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            showLoading('Creating your account...');

            try {
                // FIXED: Changed from "username" to "name" to match backend
                const response = await fetch(`${API_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: username,  // ✅ Changed from "username" to "name"
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();
                hideLoading();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showMessage('Account created successfully! Welcome to Artzone.', 'success');
                    
                    setTimeout(() => {
                        window.location.href = '/index.html';
                    }, 1500);
                } else {
                    showMessage(data.message || 'Signup failed', 'error');
                }
            } catch (error) {
                hideLoading();
                showMessage('Connection error. Make sure backend is running.', 'error');
                console.error('Signup error:', error);
            }
        });
    }

    // Helper functions
    function showMessage(message, type) {
        const existingMsg = document.querySelector('.message-alert');
        if (existingMsg) existingMsg.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-alert';
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? '#388e3c' : '#d32f2f'};
        `;

        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
    }

    function showLoading(text) {
        const existingLoader = document.querySelector('.loading-overlay');
        if (existingLoader) existingLoader.remove();

        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div style="text-align: center; color: white;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #388e3c; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    <p style="margin-top: 15px; font-size: 16px;">${text}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(loader);
    }

    function hideLoading() {
        const loader = document.querySelector('.loading-overlay');
        if (loader) loader.remove();
    }

    console.log('Login.js loaded successfully!');
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
