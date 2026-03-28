// backend-integration.js
// Handles frontend requests to the new Node.js backend

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://web-9c98.onrender.com'; // <-- You will change this when you deploy!

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

    // 3. Setup Report Download
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/download-report`;
        });
    }
});

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();

        const activeUsersEl = document.getElementById('statActiveUsers');
        const gigsCompletedEl = document.getElementById('statGigsCompleted');

        if (activeUsersEl && gigsCompletedEl) {
            activeUsersEl.textContent = data.activeUsers;
            gigsCompletedEl.textContent = data.gigsCompleted;
        }
    } catch (error) {
        console.error("Error fetching platform stats:", error);
    }
}

function setupContactForm(contactBtn) {
    const defaultModalHTML = `
        <div class="modal-overlay" id="contactSupportModal" style="display: none; align-items: center; justify-content: center; z-index: 9999;">
            <div class="auth-card" style="max-width: 400px; padding: 2rem;">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Contact Support</h2>
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
                    <button type="submit" class="btn btn-primary w-full" id="contactSubmitBtn">Send Message to Backend</button>
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
        modal.style.display = 'flex';
        statusMsg.style.display = 'none';
        form.reset();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
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
                setTimeout(() => { modal.style.display = 'none'; }, 2000);
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
            submitBtn.textContent = 'Send Message to Backend';
        }
    });
}
