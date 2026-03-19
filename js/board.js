// js/guard.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 1. THE SECURITY CHECK
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // SECURITY KICK: No valid session found, boot them to the landing page
        window.location.replace("index.html");
    } else {
        // UNIQUE INTERFACE: They are allowed in. Let's populate their specific data.
        console.log("Secure connection established for:", user.email);
        
        // Find the UI elements on whatever page they are currently on
        const nameDisplay = document.getElementById('userDisplayName') || document.getElementById('profileName');
        const emailDisplay = document.getElementById('userEmailDisplay') || document.getElementById('profileEmail');
        
        // Inject their unique Google profile data into the HTML
        if (nameDisplay) nameDisplay.textContent = user.displayName || "New Student";
        if (emailDisplay) emailDisplay.textContent = user.email;
    }
});

// 2. THE GLOBAL LOGOUT LOGIC
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            // The onAuthStateChanged listener above will automatically catch this 
            // and kick them back to index.html!
            console.log("User signed out.");
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}
