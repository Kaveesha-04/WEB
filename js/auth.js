// js/auth.js

import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const authForm = document.getElementById('authForm');

authForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

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

        // 1. SIGN UP
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Add their name to the profile
                return updateProfile(user, { displayName: fullName });
            })
            .then(() => {
                console.log("Account created!");
                window.location.href = "dashboard.html"; // Redirect to the feed
            })
            .catch((error) => {
                alert("Error: " + error.message);
                submitBtn.textContent = originalText;
            });

    } else {
        // 2. LOG IN
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Logged in!");
                window.location.href = "dashboard.html"; // Redirect to the feed
            })
            .catch((error) => {
                alert("Login failed. Please check your credentials.");
                submitBtn.textContent = originalText;
            });
    }
});
