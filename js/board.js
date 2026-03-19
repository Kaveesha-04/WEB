import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;

// ==========================================
// 1. SECURITY & SESSION GUARD
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.replace("index.html");
    } else {
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

        // Fetch gigs after user is verified
        fetchAndRenderGigs();
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
// 3. POST A GIG MODAL CONTROLS
// ==========================================
const postGigBtn = document.getElementById('postGigBtn');
const postGigModal = document.getElementById('postGigModal');
const closePostModalBtn = document.getElementById('closePostModalBtn');

if (postGigBtn && postGigModal) {
    postGigBtn.addEventListener('click', () => postGigModal.classList.add('active'));
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

        try {
            await addDoc(collection(db, "gigs"), {
                title: title,
                category: category,
                description: description,
                price: Number(price),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || "Unknown Student",
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

        if (querySnapshot.empty) {
            gigFeed.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">
                    <p>No opportunities available right now. Be the first to post a task!</p>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((doc) => {
            const gig = doc.data();
            const imageUrl = categoryImages[gig.category] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80";
            const initial = gig.authorName ? gig.authorName.charAt(0).toUpperCase() : "U";

            const card = document.createElement('div');
            card.className = "gig-card";
            card.innerHTML = `
                <div class="gig-image-wrapper">
                    <img src="${imageUrl}" alt="${gig.category}">
                </div>
                <div class="gig-content">
                    <div class="gig-author">
                        <div class="gig-author-avatar">${initial}</div>
                        <span class="gig-author-name">${gig.authorName}</span>
                    </div>
                    <h3 class="gig-title">${gig.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${gig.description}
                    </p>
                    <div class="gig-footer">
                        <span class="gig-category">${gig.category}</span>
                        <span class="gig-price">Rs. ${gig.price}</span>
                    </div>
                </div>
            `;
            gigFeed.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching gigs:", error);
        gigFeed.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 40px;">
                <p>Failed to load marketplace data. Ensure Firestore rules are configured.</p>
            </div>
        `;
    }
}
