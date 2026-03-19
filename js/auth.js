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
        e.preventDefault();

        googleBtn.innerHTML = "Opening Google...";
        googleBtn.disabled = true;

        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log("Logged in with Google as:", result.user.displayName);
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                console.error("Google Sign-In Error:", error);

                // Friendly error translation
                if (error.code !== 'auth/popup-closed-by-user') {
                    alert("Google Sign-In failed. Please try again.");
                }

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
        e.preventDefault();
        alert("Apple Developer account required to configure this feature.");
    });
}

// ==========================================
// 3. EMAIL & PASSWORD LOGIC
// ==========================================
const authForm = document.getElementById('authForm');

if (authForm) {
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const currentMode = authForm.getAttribute('data-mode');
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true; // Prevent double-clicking

        if (currentMode === 'signup') {
            const fullName = document.getElementById('fullName').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                resetButton(submitBtn, originalText);
                return;
            }

            // Execute Firebase Sign Up
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    return updateProfile(userCredential.user, { displayName: fullName });
                })
                .then(() => {
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    handleAuthError(error.code);
                    resetButton(submitBtn, originalText);
                });

        } else {
            // Execute Firebase Log In
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    handleAuthError(error.code);
                    resetButton(submitBtn, originalText);
                });
        }
    });
}

// ==========================================
// 4. FORGOT PASSWORD LOGIC
// ==========================================
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email').value;

        if (!emailInput) {
            alert("Please enter your email address in the field above first, then click 'Forgot?'.");
            return;
        }

        sendPasswordResetEmail(auth, emailInput)
            .then(() => {
                alert(`Password reset link sent to ${emailInput}! Please check your inbox.`);
            })
            .catch((error) => {
                handleAuthError(error.code);
            });
    });
}

// ==========================================
// 5. SHOW/HIDE PASSWORD LOGIC
// ==========================================
const togglePasswordBtns = document.querySelectorAll('.toggle-password');

togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const inputField = document.getElementById(targetId);

        if (inputField.type === "password") {
            inputField.type = "text";
            this.classList.add('active');
            this.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
            inputField.type = "password";
            this.classList.remove('active');
            this.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
    });
});

// ==========================================
// UTILITY FUNCTIONS (Error Handling & UI)
// ==========================================
function resetButton(btnElement, originalText) {
    btnElement.textContent = originalText;
    btnElement.disabled = false;
}

function handleAuthError(errorCode) {
    console.error("Firebase Error Code:", errorCode);
    switch (errorCode) {
        case 'auth/email-already-in-use':
            alert("This email is already registered. Please log in instead.");
            break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            alert("Incorrect email or password. Please try again.");
            break;
        case 'auth/weak-password':
            alert("Your password is too weak. It must be at least 6 characters long.");
            break;
        case 'auth/too-many-requests':
            alert("Too many failed login attempts. Please try again later or reset your password.");
            break;
        default:
            alert("An error occurred. Please try again.");
    }
}