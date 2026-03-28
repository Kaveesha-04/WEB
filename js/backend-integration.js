// backend-integration.js
// Handles frontend requests to the new Node.js backend & real data integration

import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, where, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://web-9c98.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {

    // 1. Fetch Platform Stats if on Dashboard or Index
    const statsContainer = document.getElementById('platformStatsContainer');
    if (statsContainer) {
        fetchStats();
    }

    // 2. Setup Contact Form functionality
    const contactBtn = document.getElementById('contactSupportBtn');
    if (contactBtn) {
        setupContactForm(contactBtn);
    }

    // 3. Setup Report Download (Real Data)
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                alert("Please log in to download your report.");
                return;
            }
            
            downloadReportBtn.disabled = true;
            downloadReportBtn.textContent = "Generating...";
            
            try {
                // Fetch the user's real gigs
                const gigsQuery = query(collection(db, "gigs"), where("authorId", "==", user.uid));
                const querySnapshot = await getDocs(gigsQuery);
                
                let totalValue = 0;
                let userGigs = [];
                
                querySnapshot.forEach((docSnap) => {
                    const gig = docSnap.data();
                    totalValue += Number(gig.price) || 0;
                    userGigs.push({
                        title: gig.title,
                        price: gig.price,
                        status: gig.status || 'open'
                    });
                });
                
                const payload = {
                    name: user.displayName,
                    email: user.email,
                    gigsCount: userGigs.length,
                    totalValue: totalValue,
                    gigs: userGigs
                };
                
                // Send real data to Node backend to format and generate the file
                const response = await fetch(`${API_BASE_URL}/download-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) throw new Error("Report generation failed");
                
                // Handle the file download from the backend's response
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;
                a.download = 'UniGig_Activity_Report.txt';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                
            } catch (error) {
                console.error("Error generating report:", error);
                alert("Failed to connect to Node backend for report generation. Verify Render is online.");
            } finally {
                downloadReportBtn.disabled = false;
                downloadReportBtn.textContent = "Download Activity Report";
            }
        });
    }
});

async function fetchStats() {
    try {
        const activeUsersEl = document.getElementById('statActiveUsers');
        const gigsCompletedEl = document.getElementById('statGigsCompleted');
        
        // Fetch Real Live Data from Firebase!
        const usersSnap = await getCountFromServer(collection(db, "users"));
        const gigsSnap = await getCountFromServer(collection(db, "gigs"));
        
        if (activeUsersEl) activeUsersEl.textContent = usersSnap.data().count;
        if (gigsCompletedEl) gigsCompletedEl.textContent = gigsSnap.data().count;
        
    } catch (error) {
        console.error("Error fetching real platform stats from Firebase:", error);
        // Fallback to backend dummy data natively if Firebase rules reject count query
        try {
            const response = await fetch(`${API_BASE_URL}/stats`);
            const data = await response.json();
            const activeUsersEl = document.getElementById('statActiveUsers');
            const gigsCompletedEl = document.getElementById('statGigsCompleted');
            if (activeUsersEl) activeUsersEl.textContent = data.activeUsers;
            if (gigsCompletedEl) gigsCompletedEl.textContent = data.gigsCompleted;
        } catch (e) {
            console.error("Fallback stats failed:", e);
        }
    }
}

function setupContactForm(contactBtn) {
    const defaultModalHTML = `
        <div class="modal-overlay" id="contactSupportModal" style="z-index: 9999;">
            <div class="auth-card" style="max-width: 400px; padding: 2rem;">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Message Admin</h2>
                    <button class="close-btn" id="closeContactModal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <form id="contactSupportForm">
                    <div class="form-group mb-4">
                        <label class="block mb-1 text-sm">Your Email</label>
                        <input type="email" id="contactEmail" class="w-full" required placeholder="email@uom.lk">
                    </div>
                    <div class="form-group mb-4">
                        <label class="block mb-1 text-sm">Message</label>
                        <textarea id="contactMessage" class="w-full" rows="4" required placeholder="How can we help?"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary w-full" id="contactSubmitBtn">Send to Admin</button>
                    <p id="contactStatusMessage" class="text-center mt-3 text-sm" style="display:none;"></p>
                </form>
            </div>
        </div>
    `;

    // Append modal to body if not exists
    if (!document.getElementById('contactSupportModal')) {
        document.body.insertAdjacentHTML('beforeend', defaultModalHTML);
    }

    const modal = document.getElementById('contactSupportModal');
    const closeBtn = document.getElementById('closeContactModal');
    const form = document.getElementById('contactSupportForm');
    const statusMsg = document.getElementById('contactStatusMessage');

    contactBtn.addEventListener('click', () => {
        modal.classList.add('active');
        statusMsg.style.display = 'none';
        form.reset();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Close on clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        const submitBtn = document.getElementById('contactSubmitBtn');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message })
            });

            const result = await response.json();

            statusMsg.style.display = 'block';
            if (result.success) {
                statusMsg.style.color = 'var(--accent)';
                statusMsg.textContent = result.message;
                form.reset();
                setTimeout(() => { modal.classList.remove('active'); }, 2000);
            } else {
                statusMsg.style.color = 'var(--danger)';
                statusMsg.textContent = result.message || 'Error sending message.';
            }
        } catch (error) {
            console.error("Error submitting contact form:", error);
            statusMsg.style.display = 'block';
            statusMsg.style.color = 'var(--danger)';
            statusMsg.textContent = 'Failed to connect to Node.js backend.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send to Admin';
        }
    });
}
