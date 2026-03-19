import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, query, collection, where, getDocs, deleteDoc, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Elements - Display
const profileMajor = document.getElementById('profileMajor');
const profileBio = document.getElementById('profileBio');
const skillsContainer = document.getElementById('skillsContainer');
const myGigsGrid = document.getElementById('myGigsGrid');
const myAcceptedGigsGrid = document.getElementById('myAcceptedGigsGrid');

// DOM Elements - Modal
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

// DOM Elements - Rating Modal
const ratingModal = document.getElementById('ratingModal');
const closeRatingModalBtn = document.getElementById('closeRatingModalBtn');
const starContainer = document.getElementById('starContainer');
const ratingValueInput = document.getElementById('ratingValue');
const ratingGigIdInput = document.getElementById('ratingGigId');
const ratingWorkerIdInput = document.getElementById('ratingWorkerId');
const ratingWorkerName = document.getElementById('ratingWorkerName');
const submitRatingBtn = document.getElementById('submitRatingBtn');

// DOM Elements - Inputs
const nameInput = document.getElementById('nameInput');
const majorInput = document.getElementById('majorInput');
const bioInput = document.getElementById('bioInput');
const skillsInput = document.getElementById('skillsInput');
const profileImageInput = document.getElementById('profileImageInput');

let currentUserUid = null;

// ==========================================
// 1. MODAL CONTROLS
// ==========================================
if (editProfileBtn) editProfileBtn.addEventListener('click', () => editProfileModal.classList.add('active'));
if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', () => editProfileModal.classList.remove('active'));

if (closeRatingModalBtn) closeRatingModalBtn.addEventListener('click', () => ratingModal.classList.remove('active'));

if (starContainer) {
    const stars = starContainer.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.getAttribute('data-val'));
            ratingValueInput.value = val;
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-val')) <= val) {
                    s.style.color = '#f59e0b'; // Gold
                } else {
                    s.style.color = '#cbd5e1'; // Gray
                }
            });
        });
    });
}

// ==========================================
// 1.5 GLOBAL LOGOUT
// ==========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).catch((error) => console.error("Logout Error:", error));
    });
}

// ==========================================
// 2. FETCH USER DATA ON LOAD
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.body.style.display = 'block';
        currentUserUid = user.uid;

        // Fetch Profile Information
        try {
            const userDocRef = doc(db, "users", currentUserUid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Name & Rating Render
                const nameHeader = document.getElementById('profileName');
                if (nameHeader) {
                    let ratingHTML = "";
                    if (data.rating) {
                        ratingHTML = `<span style="font-size: 0.9rem; font-weight: 500; color: #f59e0b; margin-left: 8px;">★ ${data.rating.toFixed(1)} (${data.reviewCount || 0})</span>`;
                    }
                    nameHeader.innerHTML = `${data.name || user.displayName || "Freelancer"} ${ratingHTML}`;
                    
                    if (nameInput) nameInput.value = data.name || user.displayName || "Freelancer";
                }

                // Populate the UI with saved data
                if (data.major) {
                    profileMajor.textContent = data.major;
                    majorInput.value = data.major;
                } else {
                    profileMajor.textContent = "Add your degree";
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

                if (data.profilePicture) {
                    const picDisplay = document.getElementById('profileImageDisplay');
                    const picInit = document.getElementById('profileInitial');
                    if (picDisplay && picInit) {
                        picDisplay.src = data.profilePicture;
                        picDisplay.style.display = 'block';
                        picInit.style.display = 'none';
                    }
                }
            } else {
                const nameHeader = document.getElementById('profileName');
                if (nameHeader) nameHeader.textContent = user.displayName || "Freelancer";
                profileMajor.textContent = "Add your degree";
                if (nameInput) nameInput.value = user.displayName || "Freelancer";
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }

        fetchMyGigs(currentUserUid);
        fetchAcceptedGigs(currentUserUid);
        fetchNotifications(currentUserUid);
    } else {
        window.location.replace("index.html");
    }
});

const categoryImages = {
    "Website Dev": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
    "Data Analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
    "Tutoring": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80",
    "UI/UX Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80"
};

// ==========================================
// 3. FETCH POSTED TASKS (MY WORKFLOW)
// ==========================================
async function fetchMyGigs(uid) {
    if (!myGigsGrid) return;
    myGigsGrid.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted); padding: 40px;">Loading your tasks...</div>';

    try {
        const q = query(
            collection(db, "gigs"),
            where("authorId", "==", uid)
        );
        const querySnapshot = await getDocs(q);
        
        const currentUserSnap = await getDoc(doc(db, "users", uid));
        let myProfilePic = null;
        let myName = "U";
        if (currentUserSnap.exists()) {
            myProfilePic = currentUserSnap.data().profilePicture;
            myName = currentUserSnap.data().name || "U";
        }

        let gigsData = [];
        querySnapshot.forEach(doc => gigsData.push({ id: doc.id, ...doc.data() }));
        gigsData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

        myGigsGrid.innerHTML = '';

        if (gigsData.length === 0) {
            myGigsGrid.innerHTML = `
                <div class="card" style="text-align: center; color: var(--text-muted); padding: 60px 20px;">
                    <p style="font-size: 1.1rem; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">No active tasks</p>
                    <p>Post your first task to start collaborating with the campus network.</p>
                </div>
            `;
            return;
        }

        gigsData.forEach((gig) => {
            const gigId = gig.id;
            const imageUrl = gig.image || categoryImages[gig.category] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80";

            let avatarHTML = myName.charAt(0).toUpperCase();
            if (myProfilePic) {
                avatarHTML = `<img src="${myProfilePic}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }

            let stateBadge = '';
            let actionBtn = '';
            
            if (gig.status === 'completed') {
                stateBadge = `<span style="background: #f0fdf4; color: #22c55e; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; border: 1px solid #bbf7d0;">COMPLETED</span>`;
                actionBtn = `<div style="font-size: 0.85rem; color: var(--text-muted); padding: 8px 0;">Rated Freelancer ★ ${gig.rating || 5}</div>`;
            } else if (gig.status === 'ongoing') {
                stateBadge = `<span style="background: #eff6ff; color: #3b82f6; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; border: 1px solid #bfdbfe;">IN PROGRESS</span>`;
                actionBtn = `<button class="btn btn-accent btn-sm mark-complete-btn" data-id="${gigId}" data-worker="${gig.acceptedBy || ''}" data-workername="${gig.acceptedByName || ''}" style="height: auto; padding: 8px 24px; font-size: 0.9rem;">Mark Completed</button>`;
            } else {
                stateBadge = `<span style="background: #f8fafc; color: #64748b; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; border: 1px solid #cbd5e1;">OPEN</span>`;
                actionBtn = `<button class="btn btn-outline btn-sm delete-gig-btn" data-id="${gigId}" style="height: auto; padding: 8px 24px; font-size: 0.9rem; border-color: var(--danger); color: var(--danger);">Cancel Task</button>`;
            }

            const card = document.createElement('div');
            card.style.background = "#ffffff";
            card.style.border = "1px solid var(--border-subtle)";
            card.style.borderRadius = "var(--radius-md)";
            card.style.marginBottom = "16px";
            card.style.display = "flex";
            card.style.overflow = "hidden";
            card.style.transition = "transform 0.2s, box-shadow 0.2s";
            card.style.boxShadow = "var(--shadow-sm)";
            card.style.animation = "slideUpFade 0.4s ease-out forwards";

            card.onmouseenter = () => { card.style.boxShadow = "var(--shadow-md)"; card.style.transform = "translateY(-2px)"; };
            card.onmouseleave = () => { card.style.boxShadow = "var(--shadow-sm)"; card.style.transform = "translateY(0)"; };

            card.innerHTML = `
                <div style="width: 150px; border-right: 1px solid var(--border-subtle); background: #f1f5f9; display: flex; flex-shrink: 0;">
                    <img src="${imageUrl}" alt="Task Image" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 16px; flex-wrap: wrap;">
                        <div>
                            <h4 style="margin-bottom: 6px; font-size: 1.15rem; color: var(--text-primary); font-weight: 700;">${gig.title}</h4>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--bg-hover); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; overflow: hidden; padding: 0;">
                                    ${avatarHTML}
                                </div>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">Posted by <strong style="color: var(--text-primary);">You</strong></span>
                            </div>
                        </div>
                        <div>${stateBadge}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Budget</span>
                            <span style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">Rs. ${gig.price}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            ${actionBtn}
                        </div>
                    </div>
                </div>
            `;
            myGigsGrid.appendChild(card);
        });

        // Attach Delete Listeners
        document.querySelectorAll('.delete-gig-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm("Are you sure you want to cancel and delete this open task?")) {
                    try {
                        e.target.textContent = "Deleting...";
                        e.target.disabled = true;
                        await deleteDoc(doc(db, "gigs", id));
                        fetchMyGigs(currentUserUid); // Refresh
                    } catch (err) {
                        console.error("Error deleting document: ", err);
                        alert("Failed to delete task.");
                        e.target.textContent = "Cancel Task";
                        e.target.disabled = false;
                    }
                }
            });
        });

        // Attach Mark Complete Listeners
        document.querySelectorAll('.mark-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gigId = e.target.getAttribute('data-id');
                const workerId = e.target.getAttribute('data-worker');
                const workerName = e.target.getAttribute('data-workername');

                ratingGigIdInput.value = gigId;
                ratingWorkerIdInput.value = workerId;
                ratingWorkerName.textContent = workerName || "the assigned freelancer";

                // Reset stars to 0 default
                ratingValueInput.value = 0;
                if (starContainer) {
                    starContainer.querySelectorAll('.star').forEach(s => s.style.color = '#cbd5e1');
                }

                ratingModal.classList.add('active');
            });
        });

    } catch (error) {
        console.error("Error fetching user gigs:", error);
        myGigsGrid.innerHTML = `<div class="card" style="text-align: center; color: var(--danger); padding: 40px;">Failed to load your tasks.</div>`;
    }
}

// ==========================================
// 4. SUBMIT RATING LOGIC
// ==========================================
if (submitRatingBtn) {
    submitRatingBtn.addEventListener('click', async () => {
        const gigId = ratingGigIdInput.value;
        const workerId = ratingWorkerIdInput.value;
        const rating = parseInt(ratingValueInput.value);

        if (!gigId || !workerId) return;

        submitRatingBtn.disabled = true;
        submitRatingBtn.textContent = "Submitting...";

        try {
            // Wait, we need to update the gig status
            await updateDoc(doc(db, "gigs", gigId), {
                status: 'completed',
                rating: rating,
                completedAt: new Date()
            });

            // Re-calculate user rating map
            const workerRef = doc(db, "users", workerId);
            const workerSnap = await getDoc(workerRef);
            let newRating = rating;
            let newReviewCount = 1;

            if (workerSnap.exists()) {
                const data = workerSnap.data();
                const currentRating = data.rating || 0;
                const currentCount = data.reviewCount || 0;
                newReviewCount = currentCount + 1;
                newRating = ((currentRating * currentCount) + rating) / newReviewCount;
            }

            // Save new mathematical rating to target user
            await setDoc(workerRef, {
                rating: newRating,
                reviewCount: newReviewCount
            }, { merge: true });

            ratingModal.classList.remove('active');
            fetchMyGigs(currentUserUid); // Refresh the list
        } catch (err) {
            console.error("Error rating:", err);
            alert("Failed to submit rating.");
        } finally {
            submitRatingBtn.disabled = false;
            submitRatingBtn.textContent = "Submit Rating & Complete";
        }
    });
}

// ==========================================
// 5. FETCH ACCEPTED TASKS LOGIC (Tasks user is fulfilling)
// ==========================================
async function fetchAcceptedGigs(uid) {
    const grid = myAcceptedGigsGrid;
    if (!grid) return;
    grid.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted); padding: 40px;">Loading...</div>';

    try {
        const q = query(collection(db, "gigs"), where("acceptedBy", "==", uid));
        const querySnapshot = await getDocs(q);

        let gigsData = [];
        querySnapshot.forEach(doc => gigsData.push({ id: doc.id, ...doc.data() }));
        gigsData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

        const uniqueAuthorIds = [...new Set(gigsData.map(g => g.authorId).filter(id => id))];
        const authorProfiles = {};

        await Promise.all(uniqueAuthorIds.map(async (authId) => {
            try {
                const snap = await getDoc(doc(db, "users", authId));
                if (snap.exists()) authorProfiles[authId] = snap.data();
            } catch (e) {
                console.error("Error fetching author:", e);
            }
        }));

        grid.innerHTML = '';

        if (gigsData.length === 0) {
            grid.innerHTML = `
                <div class="card" style="text-align: center; color: var(--text-muted); padding: 60px 20px;">
                    <p style="font-size: 1.1rem; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">No accepted tasks</p>
                    <p>Visit the Dashboard to browse and accept tasks posted by other students.</p>
                </div>
            `;
            return;
        }

        gigsData.forEach((gig) => {
            const imageUrl = gig.image || categoryImages[gig.category] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80";

            let statusBadge = '';
            if (gig.status === 'ongoing') {
                statusBadge = '<span style="background: #eff6ff; color: #3b82f6; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; border: 1px solid #bfdbfe;">IN PROGRESS</span>';
            } else if (gig.status === 'completed') {
                statusBadge = '<span style="background: #f0fdf4; color: #22c55e; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; border: 1px solid #bbf7d0;">DELIVERED</span>';
            }

            const initial = gig.authorName ? gig.authorName.charAt(0).toUpperCase() : "U";
            let avatarHTML = initial;
            if (gig.authorId && authorProfiles[gig.authorId] && authorProfiles[gig.authorId].profilePicture) {
                avatarHTML = `<img src="${authorProfiles[gig.authorId].profilePicture}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }

            const card = document.createElement('div');
            card.style.background = "#ffffff";
            card.style.border = "1px solid var(--border-subtle)";
            card.style.borderLeft = gig.status === 'completed' ? "4px solid #22c55e" : "4px solid #3b82f6";
            card.style.borderRadius = "var(--radius-md)";
            card.style.marginBottom = "16px";
            card.style.display = "flex";
            card.style.overflow = "hidden";
            card.style.transition = "all 0.2s ease";
            card.style.boxShadow = "var(--shadow-sm)";
            card.style.animation = "slideUpFade 0.4s ease-out forwards";

            card.onmouseenter = () => { card.style.boxShadow = "var(--shadow-md)"; card.style.transform = "translateY(-2px)"; };
            card.onmouseleave = () => { card.style.boxShadow = "var(--shadow-sm)"; card.style.transform = "translateY(0)"; };

            card.innerHTML = `
                <div style="width: 150px; border-right: 1px solid var(--border-subtle); background: #f1f5f9; display: flex; flex-shrink: 0;">
                    <img src="${imageUrl}" alt="Task Image" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 16px; flex-wrap: wrap;">
                        <div>
                            <h4 style="margin-bottom: 6px; font-size: 1.15rem; color: var(--text-primary); font-weight: 700;">${gig.title}</h4>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--bg-hover); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; overflow: hidden; padding: 0;">
                                    ${avatarHTML}
                                </div>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">Ordered by <strong style="color: var(--text-primary);">${gig.authorName || "Student"}</strong></span>
                            </div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>

                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: auto; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${gig.description}
                    </p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle); margin-top: 16px;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Pricing</span>
                            <span style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">Rs. ${gig.price}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <a href="mailto:${gig.authorEmail || ''}?subject=Regarding your task: ${encodeURIComponent(gig.title)}" class="btn btn-outline" style="padding: 8px 24px; font-size: 0.9rem; height: auto;">Email Client</a>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.error("Failed to fetch accepted tasks:", e);
        grid.innerHTML = `<div class="card" style="text-align: center; color: var(--danger); padding: 40px;">Failed to load your working tasks.</div>`;
    }
}

// ==========================================
// 6. FETCH INBOX NOTIFICATIONS
// ==========================================
async function fetchNotifications(uid) {
    const feed = document.getElementById('notificationsFeed');
    if (!feed) return;

    try {
        const q = query(collection(db, "notifications"), where("recipientId", "==", uid));
        const snapshot = await getDocs(q);
        
        // Sorting manually due to potential lack of composite index for the test UI
        let notifs = [];
        snapshot.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
        notifs.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

        feed.innerHTML = '';
        if (notifs.length === 0) {
            feed.innerHTML = '<p style="color: var(--text-muted); font-size: 0.95rem;">You have no new notifications.</p>';
            return;
        }

        notifs.forEach(notif => {
            const div = document.createElement('div');
            div.style.padding = '12px 16px';
            div.style.background = notif.read ? 'transparent' : 'var(--bg-hover)';
            div.style.border = '1px solid var(--border-subtle)';
            div.style.borderRadius = 'var(--radius-sm)';
            div.style.borderLeft = notif.read ? '' : '3px solid var(--accent)';
            const timeStr = notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleDateString() : 'Just now';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <strong style="font-size: 0.95rem; color: var(--text-primary);">${notif.senderName} accepted your task!</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${timeStr}</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">
                    Task: <strong>${notif.gigTitle}</strong>
                </p>
                <div style="margin-top: 8px;">
                    <a href="mailto:${notif.senderEmail}?subject=Re: ${encodeURIComponent(notif.gigTitle)}" class="btn btn-outline" style="font-size: 0.8rem; padding: 4px 12px; height: auto;">Email ${notif.senderName}</a>
                </div>
            `;
            feed.appendChild(div);
        });
    } catch (e) {
        console.error("Failed to load notifications:", e);
        feed.innerHTML = '<p style="color: var(--danger); font-size: 0.95rem;">Failed to load inbox.</p>';
    }
}

// ==========================================
// 7. SAVE USER DATA TO FIRESTORE
// ==========================================
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUserUid) return;

        const originalText = saveProfileBtn.textContent;
        saveProfileBtn.textContent = "Saving...";
        saveProfileBtn.disabled = true;

        const rawSkills = skillsInput.value;
        const skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s !== '');

        let profilePictureBase64 = null;
        const file = profileImageInput ? profileImageInput.files[0] : null;

        try {
            if (file) {
                profilePictureBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            }

            const userDocRef = doc(db, "users", currentUserUid);
            
            let newName = auth.currentUser ? auth.currentUser.displayName : "A Student";
            if (nameInput && nameInput.value.trim() !== "") {
                newName = nameInput.value.trim();
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: newName }).catch(e => console.error(e));
                }
            }

            const updatePayload = {
                name: newName,
                major: majorInput.value,
                bio: bioInput.value,
                skills: skillsArray,
                updatedAt: serverTimestamp()
            };
            if (profilePictureBase64) {
                updatePayload.profilePicture = profilePictureBase64;
            }

            await setDoc(userDocRef, updatePayload, { merge: true });

            const nameHeader = document.getElementById('profileName');
            if (nameHeader) {
                let ratingHTML = "";
                if (nameHeader.innerHTML.includes('<span')) {
                    ratingHTML = " " + nameHeader.innerHTML.substring(nameHeader.innerHTML.indexOf('<span'));
                }
                nameHeader.innerHTML = `${newName}${ratingHTML}`;
            }

            profileMajor.textContent = majorInput.value || "Add your degree";
            profileBio.textContent = bioInput.value || "No bio added yet. Click edit profile to tell the campus about your expertise.";

            if (profilePictureBase64) {
                const picDisplay = document.getElementById('profileImageDisplay');
                const picInit = document.getElementById('profileInitial');
                if (picDisplay && picInit) {
                    picDisplay.src = profilePictureBase64;
                    picDisplay.style.display = 'block';
                    picInit.style.display = 'none';
                }
            }

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
            alert("Profile successfully updated!");

        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes.");
        } finally {
            saveProfileBtn.textContent = originalText;
            saveProfileBtn.disabled = false;
        }
    });
}