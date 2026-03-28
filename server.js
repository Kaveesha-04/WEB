const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve the static frontend files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// Ensure server_logs directory exists
const logDir = path.join(__dirname, 'server_logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// --- FUNCTION 1: Platform Statistics API ---
app.get('/api/stats', (req, res) => {
    // Returning dummy but realistic platform statistics
    res.json({
        activeUsers: 842,
        gigsCompleted: 124,
        universities: 1
    });
});

// --- FUNCTION 2: Secure Contact Handler ---
app.post('/api/contact', (req, res) => {
    try {
        const ticket = {
            id: 'TKT-' + Math.floor(Math.random() * 10000),
            date: new Date().toISOString(),
            email: req.body.email,
            message: req.body.message
        };
        
        const filePath = path.join(logDir, 'support_tickets.json');
        fs.appendFileSync(filePath, JSON.stringify(ticket) + '\n');
        
        res.json({ success: true, message: "Ticket securely received by Node.js backend!" });
    } catch (error) {
        console.error("Error saving ticket:", error);
        res.status(500).json({ success: false, message: "Failed to process ticket." });
    }
});

// --- FUNCTION 3: Generate Downloadable Report ---
app.get('/api/download-report', (req, res) => {
    try {
        const reportContent = `UniGig Activity Report\n=====================\nGenerated on: ${new Date().toLocaleString()}\nStatus: Active Account\nTotal Gigs Completed: 12\nEarnings: LKR 45,000\n`;
        
        const reportPath = path.join(logDir, 'temp_report.txt');
        fs.writeFileSync(reportPath, reportContent);
        
        // Force the user's browser to download the file
        res.download(reportPath, 'UniGig_Activity_Report.txt', (err) => {
            if (err) {
                console.error("Error sending file:", err);
            }
        }); 
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).send("Report generation failed.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Node.js Backend API successfully running on http://localhost:${PORT}`);
});
