// js/auth.js

import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile, 
    GoogleAuthProvider,
    signInWithPopup
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
}