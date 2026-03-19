import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, query, collection, where, getDocs, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Elements - Display
const profileMajor = document.getElementById('profileMajor');
const profileBio = document.getElementById('profileBio');
const skillsContainer = document.getElementById('skillsContainer');
const myGigsGrid = document.getElementById('myGigsGrid');

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

// 2. FETCH USER DATA & GIGS ON LOAD
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;

        // Fetch Profile Information
        try {
            const userDocRef = doc(db, "users", currentUserUid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Populate the UI with saved data
                if (data.major) {
                    profileMajor.textContent = data.major;
                    majorInput.value = data.major;
                } else {
                    profileMajor.textContent = "Student";
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
                        span.className = 'category-pill';
                        span.style.margin = '0 8px 8px 0';
                        span.textContent = skill;
                        skillsContainer.appendChild(span);
                    });
                }
            } else {
                profileMajor.textContent = "Student";
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }

        // Fetch User's Active Gigs
        fetchMyGigs(currentUserUid);
    }
});

// 3. FETCH USER GIGS LOGIC
const categoryImages = {
    "Website Dev": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
    "Data Analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
    "Tutoring": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80",
    "UI/UX Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80"
};

async function fetchMyGigs(uid) {
    if (!myGigsGrid) return;
    myGigsGrid.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted); padding: 40px;">Loading your tasks...</div>';

    try {
        const q = query(
            collection(db, "gigs"),
            where("authorId", "==", uid),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        myGigsGrid.innerHTML = '';

        if (querySnapshot.empty) {
            myGigsGrid.innerHTML = `
                <div class="card" style="text-align: center; color: var(--text-muted); padding: 60px 20px;">
                    <p style="font-size: 1.1rem; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">No active tasks</p>
                    <p>Post your first task to start collaborating with the campus network.</p>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const gig = docSnap.data();
            const gigId = docSnap.id;
            const imageUrl = categoryImages[gig.category] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80";

            const card = document.createElement('div');
            card.className = "gig-card";
            card.innerHTML = `
                <div class="gig-image-wrapper">
                    <img src="${imageUrl}" alt="${gig.category}">
                </div>
                <div class="gig-content">
                    <h3 class="gig-title">${gig.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${gig.description}
                    </p>
                    <div class="gig-footer">
                        <span class="gig-price">Rs. ${gig.price}</span>
                        <button class="btn btn-danger btn-sm delete-gig-btn" data-id="${gigId}" style="height: 32px; padding: 0 12px; font-size: 0.8rem; background: transparent; border: 1px solid var(--danger); color: var(--danger); border-radius: 4px; cursor: pointer;">Delete</button>
                    </div>
                </div>
            `;
            myGigsGrid.appendChild(card);
        });

        // Attach Delete Listeners
        document.querySelectorAll('.delete-gig-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this task?")) {
                    try {
                        e.target.textContent = "Deleting...";
                        e.target.disabled = true;
                        await deleteDoc(doc(db, "gigs", id));
                        fetchMyGigs(currentUserUid); // Refresh
                    } catch (err) {
                        console.error("Error deleting document: ", err);
                        alert("Failed to delete task.");
                        e.target.textContent = "Delete";
                        e.target.disabled = false;
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error fetching user gigs:", error);
        
        // This fails if the user hasn't created a composite index yet for where + orderBy
        if(error.message.includes("indexes?create_composite")) {
            console.warn("Firestore index missing. Falling back to un-ordered fetch.");
            fallbackFetchUnorderedGigs(uid);
        } else {
            myGigsGrid.innerHTML = `<div class="card" style="text-align: center; color: var(--danger); padding: 40px;">Failed to load your tasks. Check console for details.</div>`;
        }
    }
}

// Fallback logic incase Firestore composite index isn't ready
async function fallbackFetchUnorderedGigs(uid) {
    try {
        const q = query(collection(db, "gigs"), where("authorId", "==", uid));
        const querySnapshot = await getDocs(q);
        
        myGigsGrid.innerHTML = '';

        if (querySnapshot.empty) {
            myGigsGrid.innerHTML = `
                <div class="card" style="text-align: center; color: var(--text-muted); padding: 60px 20px;">
                    <p style="font-size: 1.1rem; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">No active tasks</p>
                    <p>Post your first task to start collaborating with the campus network.</p>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const gig = docSnap.data();
            const gigId = docSnap.id;
            const imageUrl = categoryImages[gig.category] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80";

            const card = document.createElement('div');
            card.className = "gig-card";
            card.innerHTML = `
                <div class="gig-image-wrapper">
                    <img src="${imageUrl}" alt="${gig.category}">
                </div>
                <div class="gig-content">
                    <h3 class="gig-title">${gig.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${gig.description}
                    </p>
                    <div class="gig-footer">
                        <span class="gig-price">Rs. ${gig.price}</span>
                        <button class="btn btn-danger btn-sm delete-gig-btn" data-id="${gigId}" style="height: 32px; padding: 0 12px; font-size: 0.8rem; background: transparent; border: 1px solid var(--danger); color: var(--danger); border-radius: 4px; cursor: pointer;">Delete</button>
                    </div>
                </div>
            `;
            myGigsGrid.appendChild(card);
        });

        // Attach Delete Listeners
        document.querySelectorAll('.delete-gig-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this task?")) {
                    try {
                        e.target.textContent = "Deleting...";
                        e.target.disabled = true;
                        await deleteDoc(doc(db, "gigs", id));
                        fetchMyGigs(currentUserUid); // Refresh
                    } catch (err) {
                        alert("Failed to delete task.");
                        e.target.textContent = "Delete";
                        e.target.disabled = false;
                    }
                }
            });
        });

        console.warn("Please build the Firestore Composite Index to enable Date ordering.");
    } catch(err) {
        console.error("Fallback failed:", err);
    }
}

// 4. SAVE DATA TO FIRESTORE
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUserUid) return;

        const originalText = saveProfileBtn.textContent;
        saveProfileBtn.textContent = "Saving...";
        saveProfileBtn.disabled = true;

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

            profileMajor.textContent = majorInput.value || "Student";
            profileBio.textContent = bioInput.value || "No bio added yet. Click edit profile to tell the campus about your expertise.";

            skillsContainer.innerHTML = '';
            if (skillsArray.length > 0) {
                skillsArray.forEach(skill => {
                    const span = document.createElement('span');
                    span.className = 'category-pill';
                    span.style.margin = '0 8px 8px 0';
                    span.textContent = skill;
                    skillsContainer.appendChild(span);
                });
            } else {
                skillsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">No skills added yet.</span>';
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