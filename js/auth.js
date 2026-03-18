// js/auth.js

import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile, 
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// ==========================================
// 1. GOOGLE SIGN-IN LOGIC
// ==========================================
const googleBtn = document.getElementById('googleBtn');
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop any default HTML button behavior
        
        // Disable button to prevent double clicks
        googleBtn.innerHTML = "Opening Google...";
        googleBtn.disabled = true;

        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log("Logged in with Google as:", result.user.displayName);
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                console.error("Google Sign-In Error:", error);
                alert("Google Sign-In failed: " + error.message);
                
                // Reset button
                googleBtn.innerHTML = `<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> Continue with Google`;
                googleBtn.disabled = false;
            });
    });
}

// ==========================================
// 2. APPLE SIGN-IN LOGIC (Placeholder)
// ==========================================
const appleBtn = document.getElementById('appleBtn');

if (appleBtn) {
    appleBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop any default HTML button behavior
        alert("Apple Developer account required to configure this feature.");
    });
}

// ==========================================
// 3. EMAIL & PASSWORD LOGIC
// ==========================================
const authForm = document.getElementById('authForm');

if (authForm) {
    authForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the page from refreshing

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const currentMode = authForm.getAttribute('data-mode');

        // Change the button text so the user knows it's loading
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';

        if (currentMode === 'signup') {
            const fullName = document.getElementById('fullName').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                submitBtn.textContent = originalText;
                return;
            }

            // Execute Firebase Sign Up
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    // Add their name to the profile immediately
                    return updateProfile(user, { displayName: fullName });
                })
                .then(() => {
                    console.log("Account created!");
                    window.location.href = "dashboard.html"; 
                })
                .catch((error) => {
                    alert("Error: " + error.message);
                    submitBtn.textContent = originalText;
                });

        } else {
            // Execute Firebase Log In
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log("Logged in!");
                    window.location.href = "dashboard.html"; 
                })
                .catch((error) => {
                    alert("Login failed. Please check your credentials.");
                    submitBtn.textContent = originalText;
                });
        }
    });

    // ==========================================
    // 4. FORGOT PASSWORD LOGIC
    // ==========================================
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop the link from jumping to the top of the page
            
            const emailInput = document.getElementById('email').value;

            // Ensure they actually typed an email before clicking "Forgot?"
            if (!emailInput) {
                alert("Please enter your email address in the field above first, then click 'Forgot?'.");
                return;
            }

            // Send the reset email
            sendPasswordResetEmail(auth, emailInput)
                .then(() => {
                    alert(`Password reset email sent to ${emailInput}! Please check your inbox.`);
                })
                .catch((error) => {
                    console.error("Password Reset Error:", error);
                    alert("Error sending reset email: " + error.message);
                });
        });
    }

    // ==========================================
    // 5. SHOW/HIDE PASSWORD LOGIC
    // ==========================================
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Find the specific input this button controls
            const targetId = this.getAttribute('data-target');
            const inputField = document.getElementById(targetId);
            
            // Toggle the type attribute
            if (inputField.type === "password") {
                inputField.type = "text";
                this.classList.add('active');
                // Change SVG to "Eye Off" (slash through it)
                this.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                inputField.type = "password";
                this.classList.remove('active');
                // Change SVG back to normal "Eye"
                this.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    });
}