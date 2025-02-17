document.addEventListener("DOMContentLoaded", function () {
    // Cache DOM elements
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const signInForm = document.querySelector(".sign-in form");
    const signUpForm = document.querySelector(".sign-up form");
    const loadingIndicator = document.getElementById("loading");
    
    // Get stored users or initialize empty array
    const registeredUsers = JSON.parse(localStorage.getItem("users")) || [];
    
    // Password hashing function (note: in a production environment, use a server-side solution)
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Validation functions
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function validatePassword(password) {
        // Require at least 8 characters with at least one number and one letter
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    }
    
    function showFormError(form, message) {
        // Create or update error message element
        let errorElement = form.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.style.color = 'red';
            errorElement.style.marginTop = '10px';
            form.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    function clearFormError(form) {
        const errorElement = form.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    // Handle sign-in submission
    if (signInForm) {
        signInForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearFormError(signInForm);
            
            const emailInput = signInForm.querySelector("input[type='email']");
            const passwordInput = signInForm.querySelector("input[type='password']");
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Basic validation
            if (email === "" || password === "") {
                showFormError(signInForm, "Please fill in all fields.");
                return;
            }
            
            // Show loading state
            if (loadingIndicator) loadingIndicator.style.display = "block";
            const submitButton = signInForm.querySelector("button[type='submit']");
            if (submitButton) submitButton.disabled = true;
            
            try {
                const hashedPassword = await hashPassword(password);
                const userExists = registeredUsers.find(user => 
                    user.email === email && user.password === hashedPassword
                );
                
                if (userExists) {
                    // Set session and redirect
                    sessionStorage.setItem("loggedInUser", email);
                    
                    // Optional: store user's name for greeting
                    sessionStorage.setItem("userName", userExists.name);
                    
                    window.location.href = "index.html";
                } else {
                    showFormError(signInForm, "Invalid email or password.");
                }
            } catch (error) {
                console.error("Login error:", error);
                showFormError(signInForm, "An error occurred. Please try again.");
            } finally {
                if (submitButton) submitButton.disabled = false;
                if (loadingIndicator) loadingIndicator.style.display = "none";
            }
        });
    }
    
    // Handle sign-up submission
    if (signUpForm) {
        signUpForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearFormError(signUpForm);
            
            const nameInput = signUpForm.querySelector("input[placeholder='Name']");
            const emailInput = signUpForm.querySelector("input[type='email']");
            const passwordInput = signUpForm.querySelector("input[type='password']");
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Validation
            if (name === "" || email === "" || password === "") {
                showFormError(signUpForm, "Please fill in all fields.");
                return;
            }
            
            if (!validateEmail(email)) {
                showFormError(signUpForm, "Please enter a valid email address.");
                return;
            }
            
            if (!validatePassword(password)) {
                showFormError(signUpForm, "Password must be at least 8 characters long and contain both letters and numbers.");
                return;
            }
            
            if (registeredUsers.some(user => user.email === email)) {
                showFormError(signUpForm, "This email is already registered. Please log in.");
                return;
            }
            
            // Show loading state
            if (loadingIndicator) loadingIndicator.style.display = "block";
            const submitButton = signUpForm.querySelector("button[type='submit']");
            if (submitButton) submitButton.disabled = true;
            
            try {
                const hashedPassword = await hashPassword(password);
                
                // Add user to the registry
                registeredUsers.push({ 
                    name: name, 
                    email: email, 
                    password: hashedPassword,
                    createdAt: new Date().toISOString()
                });
                
                localStorage.setItem("users", JSON.stringify(registeredUsers));
                
                // Success message and reset form
                showFormError(signUpForm, "Account created successfully! You can now sign in.");
                signUpForm.reset();
                
                // Switch to sign-in panel after successful registration
                if (container) {
                    setTimeout(() => {
                        container.classList.remove("active");
                        clearFormError(signUpForm);
                    }, 2000);
                }
            } catch (error) {
                console.error("Registration error:", error);
                showFormError(signUpForm, "An error occurred. Please try again.");
            } finally {
                if (submitButton) submitButton.disabled = false;
                if (loadingIndicator) loadingIndicator.style.display = "none";
            }
        });
    }
    
    // Panel switching functionality
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (container) container.classList.add("active");
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (container) container.classList.remove("active");
        });
    }
    
    // Check if user is already logged in
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    if (loggedInUser && window.location.pathname.includes("login.html")) {
        window.location.href = "index.html";
    }
});