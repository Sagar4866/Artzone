const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    
    console.log('✅ Signup.js loaded successfully!');

    // IMPROVED: Show message function with fallback
    function showMessage(type, text) {
        console.log(`Message (${type}):`, text); // Always log to console
        
        const box = document.getElementById("messageArea");
        if (box) {
            box.style.display = "block";
            box.className = "message " + (type === "error" ? "error-message" : "success-message");
            box.textContent = text;
        } else {
            // Fallback: Create floating message if messageArea doesn't exist
            const msg = document.createElement('div');
            msg.textContent = text;
            msg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                background: ${type === 'error' ? '#f44336' : '#4CAF50'};
                color: white;
                border-radius: 8px;
                z-index: 10000;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 4000);
        }
    }

    // Toggle password visibility
    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (input && input.type === "password") {
                input.type = "text";
                btn.innerHTML = `👁️`;
            } else if (input) {
                input.type = "password";
                btn.innerHTML = `👁️`;
            }
        });
    });

    // FORM SUBMISSION
    const signupForm = document.getElementById("signupForm");
    
    if (!signupForm) {
        console.error('❌ ERROR: Signup form not found! Check if your HTML has id="signupForm"');
        return;
    }
    
    console.log('✅ Form found:', signupForm);
    
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        console.log('🚀 Form submitted!');

        const fullNameInput = document.getElementById("fullName");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmInput = document.getElementById("confirmPassword");

        console.log('Input elements:', {
            fullName: fullNameInput,
            email: emailInput,
            password: passwordInput,
            confirm: confirmInput
        });

        if (!fullNameInput || !emailInput || !passwordInput || !confirmInput) {
            showMessage("error", "Form fields not found. Check HTML IDs.");
            return;
        }

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        console.log('Form values:', { fullName, email, password: '***', confirm: '***' });

        // Validation
        if (fullName.length < 3) {
            showMessage("error", "Full name must be at least 3 characters.");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            showMessage("error", "Enter a valid email address.");
            return;
        }

        const strongPass = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!strongPass.test(password)) {
            showMessage("error", "Password must be 6+ characters with letters AND numbers.");
            return;
        }

        if (password !== confirm) {
            showMessage("error", "Passwords do not match.");
            return;
        }

        console.log('✅ All validations passed!');

        // Show loading
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
        submitBtn.style.opacity = "0.7";

        try {
            console.log('📡 Sending request to:', `${API_URL}/api/auth/signup`);
            
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: fullName,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            console.log('📩 Response:', data);

            if (response.ok) {
                // SUCCESS
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showMessage("success", "✅ Account created! Redirecting...");
                
                setTimeout(() => {
                    window.location.href = "/index.html";
                }, 1500);
            } else {
                // Backend error
                showMessage("error", data.message || "Signup failed. Email may already exist.");
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = "1";
            }

        } catch (error) {
            console.error('❌ Signup error:', error);
            showMessage("error", "Connection error! Make sure server is running on port 5000.");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = "1";
        }
    });
});
