// js/profile.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// UI Elements
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

const majorInput = document.getElementById('majorInput');
const bioInput = document.getElementById('bioInput');

// We will store the user's UID here once they are verified
let currentUserUid = null;

// 1. OPEN / CLOSE MODAL LOGIC
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => editProfileModal.classList.add('active'));
}
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => editProfileModal.classList.remove('active'));
}

// 2. THE FIREBASE CONNECTION
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid; // Lock in their secure ID
        
        // --- THE READER ---
        // Look inside the "users" collection for a document named with their UID
        const userDocRef = doc(db, "users", currentUserUid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Found existing profile data!");
            
            // If we had a place in profile.html to show these, we'd inject them here.
            // For now, let's pre-fill the edit inputs so they don't have to retype it
            if (userData.major) majorInput.value = userData.major;
            if (userData.bio) bioInput.value = userData.bio;
        } else {
            console.log("No custom profile data found yet. They are a new user.");
        }
    }
});

// 3. THE WRITER
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUserUid) return; // Security check
        
        const originalText = saveProfileBtn.textContent;
        saveProfileBtn.textContent = "Saving...";

        const newMajor = majorInput.value;
        const newBio = bioInput.value;

        try {
            // Point directly to their specific UID folder in the "users" collection
            const userDocRef = doc(db, "users", currentUserUid);
            
            // setDoc will create the folder if it doesn't exist, or overwrite it if it does.
            // { merge: true } ensures we don't accidentally delete other data they might have
            await setDoc(userDocRef, {
                major: newMajor,
                bio: newBio,
                updatedAt: new Date()
            }, { merge: true });

            alert("Profile successfully updated!");
            editProfileModal.classList.remove('active');
            saveProfileBtn.textContent = originalText;
            
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Check the console.");
            saveProfileBtn.textContent = originalText;
        }
    });
}
