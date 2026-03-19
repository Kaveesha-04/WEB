// js/profile.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements - Display
const profileMajor = document.getElementById('profileMajor');
const profileBio = document.getElementById('profileBio');
const skillsContainer = document.getElementById('skillsContainer');

// DOM Elements - Modal
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

// DOM Elements - Inputs
const majorInput = document.getElementById('majorInput');
const bioInput = document.getElementById('bioInput');
const skillsInput = document.getElementById('skillsInput');

let currentUserUid = null;

// 1. MODAL CONTROLS
if (editProfileBtn) editProfileBtn.addEventListener('click', () => editProfileModal.classList.add('active'));
if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', () => editProfileModal.classList.remove('active'));

// 2. FETCH USER DATA ON LOAD
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;

        try {
            const userDocRef = doc(db, "users", currentUserUid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Populate the UI with saved data
                if (data.major) {
                    profileMajor.textContent = data.major;
                    majorInput.value = data.major;
                }
                if (data.bio) {
                    profileBio.textContent = data.bio;
                    bioInput.value = data.bio;
                }

                // Populate Skills
                if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
                    skillsInput.value = data.skills.join(', ');
                    skillsContainer.innerHTML = '';

                    data.skills.forEach(skill => {
                        const span = document.createElement('span');
                        span.className = 'skill-pill';
                        span.textContent = skill;
                        skillsContainer.appendChild(span);
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }
});

// 3. SAVE DATA TO FIRESTORE
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUserUid) return;

        const originalText = saveProfileBtn.textContent;
        saveProfileBtn.textContent = "Saving...";
        saveProfileBtn.disabled = true;

        // Clean up the skills input into an array
        const rawSkills = skillsInput.value;
        const skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s !== '');

        try {
            const userDocRef = doc(db, "users", currentUserUid);

            await setDoc(userDocRef, {
                major: majorInput.value,
                bio: bioInput.value,
                skills: skillsArray,
                updatedAt: new Date()
            }, { merge: true });

            // Update the UI immediately 
            profileMajor.textContent = majorInput.value || "Student";
            profileBio.textContent = bioInput.value || "This user hasn't written a bio yet.";

            skillsContainer.innerHTML = '';
            if (skillsArray.length > 0) {
                skillsArray.forEach(skill => {
                    const span = document.createElement('span');
                    span.className = 'skill-pill';
                    span.textContent = skill;
                    skillsContainer.appendChild(span);
                });
            } else {
                skillsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No skills added yet.</span>';
            }

            editProfileModal.classList.remove('active');

        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes.");
        } finally {
            saveProfileBtn.textContent = originalText;
            saveProfileBtn.disabled = false;
        }
    });
}