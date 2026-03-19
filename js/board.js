import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;

// ==========================================
// 1. SECURITY & SESSION GUARD
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("index.html");
    } else {
        document.body.style.display = 'block';
        currentUser = user;
        console.log("Secure connection established for:", user.email);

        const nameDisplay = document.getElementById('userDisplayName');
        const emailDisplay = document.getElementById('userEmailDisplay');
        const userInitial = document.getElementById('userInitial');

        if (nameDisplay) nameDisplay.textContent = user.displayName || "New Student";
        if (emailDisplay) emailDisplay.textContent = user.email;
        if (userInitial && user.displayName) {
            userInitial.textContent = user.displayName.charAt(0).toUpperCase();
        }

        // Load custom profile picture into Dashboard Sidebar Header
        try {
            const { getDoc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            const userDocRef = doc(db, "users", user.uid);

            // Proactively initialize the user's document so the 5-Star Rating engine can target it later
            await setDoc(userDocRef, {
                name: user.displayName || "Freelancer",
                email: user.email,
                lastLogin: serverTimestamp()
            }, { merge: true });

            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().profilePicture) {
                const dashImg = document.getElementById('dashboardUserImage');
                if (dashImg) {
                    dashImg.src = docSnap.data().profilePicture;
                    dashImg.style.display = 'block';
                    if (userInitial) userInitial.style.display = 'none';
                }
            }
        } catch (e) {
            console.error("Dashboard avatar injection failed:", e);
        }

        // Fetch gigs after user is verified
        fetchAndRenderGigs();
        fetchLeaderboard();
    }
});

// ==========================================
// 2. GLOBAL LOGOUT
// ==========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).catch((error) => console.error("Logout Error:", error));
    });
}

// ==========================================
// 3. GIG DETAILS MODAL INJECTION
// ==========================================
function injectGigDetailsModal() {
    if (document.getElementById('gigDetailsModal')) return;
    
    const modalHTML = `
    <div class="modal-overlay" id="gigDetailsModal">
        <div class="auth-card" style="max-width: 600px; padding: 0; overflow: hidden; position: relative;">
            <div id="gdImage" style="height: 250px; background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
            <div style="padding: 32px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div>
                        <span id="gdCategory" class="gig-category" style="margin-bottom: 12px; display: inline-block;">Category</span>
                        <h2 id="gdTitle" style="font-size: 1.5rem; margin-bottom: 12px; line-height: 1.3;">Gig Title</h2>
                        <div class="gig-author" style="margin-bottom: 0;">
                            <div class="gig-author-avatar" id="gdAvatar">U</div>
                            <span class="gig-author-name" id="gdAuthor">Author Name</span>
                        </div>
                    </div>
                    <span id="gdPrice" class="gig-price" style="font-size: 1.25rem;">Rs. 0</span>
                </div>
                
                <h3 style="font-size: 1.1rem; margin-bottom: 12px; border-top: 1px solid var(--border-subtle); padding-top: 20px;">Project Description</h3>
                <p id="gdDescription" style="color: var(--text-muted); font-size: 1rem; line-height: 1.6; margin-bottom: 24px; white-space: pre-wrap;">Full description...</p>
                
                <div id="gdActions" style="display: flex; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 24px;">
                </div>
            </div>
            <button class="close-btn" id="closeGdBtn" style="position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: background 0.2s;">✕</button>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('gigDetailsModal');
    const closeBtn = document.getElementById('closeGdBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}
injectGigDetailsModal();

window.openGigDetails = function(gig, imageUrl, initial, isOwner) {
    document.getElementById('gdImage').style.backgroundImage = `url(${imageUrl})`;
    document.getElementById('gdCategory').textContent = gig.category;
    document.getElementById('gdTitle').textContent = gig.title;
    document.getElementById('gdAvatar').textContent = initial;
    document.getElementById('gdAuthor').textContent = gig.authorName;
    document.getElementById('gdPrice').textContent = `Rs. ${gig.price}`;
    document.getElementById('gdDescription').textContent = gig.description;

    const actionsContainer = document.getElementById('gdActions');
    if (isOwner) {
        actionsContainer.innerHTML = `<span style="flex: 1; text-align: center; font-size: 0.95rem; color: var(--text-muted); padding: 12px 0; background: var(--bg-hover); border-radius: var(--radius-sm); font-weight: 500;">This is your active task</span>`;
    } else {
        const encodedTitle = encodeURIComponent(gig.title || 'Task');
        const targetEmail = gig.authorEmail || "student@uom.lk";
        const inquireHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=Inquiry%20on%20Task:%20${encodedTitle}`;
        
        actionsContainer.innerHTML = `
            <button id="inAppAcceptBtn" class="btn btn-primary" style="flex: 1; height: 44px; font-size: 1rem; border: none; border-radius: 4px; cursor: pointer; color: white;">Accept Project</button>
            <a href="${inquireHref}" target="_blank" class="btn btn-outline" style="flex: 1; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; height: 44px; font-size: 1rem;">Inquire via Gmail</a>
        `;
        
        const acceptBtn = document.getElementById('inAppAcceptBtn');
        if (acceptBtn) {
            acceptBtn.onclick = async () => {
                if (!currentUser) {
                    alert('Please log in first.');
                    return;
                }
                acceptBtn.textContent = 'Processing...';
                acceptBtn.disabled = true;
                try {
                    await updateDoc(doc(db, "gigs", gig.id), {
                        status: "ongoing",
                        acceptedBy: currentUser.uid,
                        acceptedByName: currentUser.displayName || "A Student",
                        acceptedByEmail: currentUser.email || "",
                        acceptedAt: serverTimestamp()
                    });

                    await addDoc(collection(db, "notifications"), {
                        recipientId: gig.authorId,
                        senderId: currentUser.uid,
                        senderName: currentUser.displayName || "A Student",
                        senderEmail: currentUser.email || "",
                        gigId: gig.id,
                        gigTitle: gig.title,
                        type: "accepted",
                        read: false,
                        createdAt: serverTimestamp()
                    });
                    acceptBtn.textContent = 'Successfully Accepted!';
                    acceptBtn.style.background = 'var(--success)';
                } catch (err) {
                    console.error("Notif Error:", err);
                    acceptBtn.textContent = 'Accepting Failed';
                    acceptBtn.disabled = false;
                }
            };
        }
    }
    
    document.getElementById('gigDetailsModal').classList.add('active');
};

// ==========================================
// 3. POST A GIG MODAL CONTROLS
// ==========================================
const postGigBtn = document.getElementById('postGigBtn');
const postGigBannerBtn = document.getElementById('postGigBannerBtn');
const postGigModal = document.getElementById('postGigModal');
const closePostModalBtn = document.getElementById('closePostModalBtn');

if (postGigBtn && postGigModal) {
    postGigBtn.addEventListener('click', () => postGigModal.classList.add('active'));
}
if (postGigBannerBtn && postGigModal) {
    postGigBannerBtn.addEventListener('click', () => postGigModal.classList.add('active'));
}

if (closePostModalBtn && postGigModal) {
    closePostModalBtn.addEventListener('click', () => postGigModal.classList.remove('active'));
}

if (postGigModal) {
    postGigModal.addEventListener('click', (e) => {
        if (e.target === postGigModal) {
            postGigModal.classList.remove('active');
        }
    });
}

// ==========================================
// 4. POST GIG TO FIRESTORE
// ==========================================
const postGigForm = document.getElementById('postGigForm');
const submitGigBtn = document.getElementById('submitGigBtn');

if (postGigForm) {
    postGigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const originalText = submitGigBtn.textContent;
        submitGigBtn.textContent = 'Publishing...';
        submitGigBtn.disabled = true;

        const title = document.getElementById('gigTitle').value;
        const category = document.getElementById('gigCategory').value;
        const description = document.getElementById('gigDescription').value;
        const price = document.getElementById('gigPrice').value;
        const fileInput = document.getElementById('gigImage');
        
        let imageBase64 = null;
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            try {
                imageBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            } catch (err) {
                console.error("Image read error:", err);
            }
        }

        try {
            await addDoc(collection(db, "gigs"), {
                title: title,
                category: category,
                description: description,
                price: Number(price),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || "Unknown Student",
                authorEmail: currentUser.email || "",
                status: "open",
                image: imageBase64,
                createdAt: serverTimestamp()
            });

            postGigForm.reset();
            postGigModal.classList.remove('active');
            
            // Refresh feed
            fetchAndRenderGigs();
            
        } catch (error) {
            console.error("Error posting gig:", error);
            alert("Failed to post gig. Check console for details.");
        } finally {
            submitGigBtn.textContent = originalText;
            submitGigBtn.disabled = false;
        }
    });
}

// ==========================================
// 5. FETCH & RENDER GIGS (MARKETPLACE)
// ==========================================
const gigFeed = document.getElementById('gigFeed');

const categoryImages = {
    "Website Dev": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
    "Data Analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
    "Tutoring": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80",
    "UI/UX Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80"
};

async function fetchAndRenderGigs() {
    if (!gigFeed) return;

    try {
        const gigsQuery = query(collection(db, "gigs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(gigsQuery);

        gigFeed.innerHTML = ""; // Clear loader
        let myActiveGigs = 0;
        const activeGigCountDashboard = document.getElementById('activeGigCountDashboard');

        if (querySnapshot.empty) {
            gigFeed.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">
                    <p>No opportunities available right now. Be the first to post a task!</p>
                </div>
            `;
            if (activeGigCountDashboard) activeGigCountDashboard.textContent = 0;
            return;
        }

        let gigsData = [];
        querySnapshot.forEach((docSnapshot) => {
            const gig = docSnapshot.data();
            gig.id = docSnapshot.id;
            if (gig.status && gig.status !== "open") return;
            gigsData.push(gig);
        });

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

        gigsData.forEach((gig) => {
            if (currentUser && gig.authorId === currentUser.uid) {
                myActiveGigs++;
            }

            const imageUrl = gig.image || categoryImages[gig.category] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80";
            const initial = gig.authorName ? gig.authorName.charAt(0).toUpperCase() : "U";
            const isOwner = currentUser && gig.authorId === currentUser.uid;

            let avatarHTML = initial;
            if (authorProfiles[gig.authorId] && authorProfiles[gig.authorId].profilePicture) {
                avatarHTML = `<img src="${authorProfiles[gig.authorId].profilePicture}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }

            const card = document.createElement('div');
            card.className = "gig-card";
            card.style.cursor = "pointer";
            
            card.addEventListener('click', () => {
                if (window.openGigDetails) {
                    window.openGigDetails(gig, imageUrl, avatarHTML, isOwner);
                }
            });

            card.innerHTML = `
                <div class="gig-image-wrapper">
                    <img src="${imageUrl}" alt="${gig.category}">
                </div>
                <div class="gig-content" style="display: flex; flex-direction: column; flex: 1;">
                    <div class="gig-author">
                        <div class="gig-author-avatar" style="overflow: hidden; padding: 0;">${avatarHTML}</div>
                        <span class="gig-author-name">${gig.authorName}</span>
                    </div>
                    <h3 class="gig-title">${gig.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${gig.description}
                    </p>
                    <div class="gig-footer" style="margin-top: auto;">
                        <span class="gig-category">${gig.category}</span>
                        <span class="gig-price">Rs. ${gig.price}</span>
                    </div>
                </div>
            `;
            gigFeed.appendChild(card);
        });

        if (activeGigCountDashboard) {
            activeGigCountDashboard.textContent = myActiveGigs;
        }

    } catch (error) {
        console.error("Error fetching gigs:", error);
        gigFeed.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 40px;">
                <p>Failed to load marketplace data. Ensure Firestore rules are configured.</p>
            </div>
        `;
    }
}

// ==========================================
// 6. FETCH LEADERBOARD WIDGET
// ==========================================
async function fetchLeaderboard() {
    const feed = document.getElementById('leaderboardFeed');
    if (!feed) return;
    
    try {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        
        let users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.reviewCount && data.reviewCount > 0) {
                users.push({ id: doc.id, ...data });
            }
        });
        
        // Sort by rating (desc), then reviewCount (desc)
        users.sort((a,b) => {
            if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
            return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
        
        // Take top 5
        const topUsers = users.slice(0, 5);
        
        feed.innerHTML = '';
        if (users.length === 0) {
            feed.innerHTML = '<span style="font-size: 0.9rem; color: var(--text-muted);">No rated freelancers yet.</span>';
            return;
        }
        
        topUsers.forEach((u, index) => {
            let color = 'var(--text-muted)';
            if (index === 0) color = '#f59e0b';
            else if (index === 1) color = '#94a3b8';
            else if (index === 2) color = '#cd7f32';

            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'space-between';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1rem; font-weight: bold; color: ${color};">#${index + 1}</span>
                    <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary);">${u.name || u.major || 'Student'}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                    <span style="color: #f59e0b;">★ ${u.rating ? u.rating.toFixed(1) : 0}</span> (${u.reviewCount})
                </div>
            `;
            feed.appendChild(div);
        });
        
    } catch (err) {
        console.error("Leaderboard Error:", err);
        feed.innerHTML = '<span style="font-size: 0.9rem; color: var(--danger);">Failed to list ranks.</span>';
    }
}
