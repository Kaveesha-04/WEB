# 🚀 UniGig: Campus Micro-Task & Freelance Board

## 📖 Project Overview
University students often need quick favors, technical help, or have skills they want to monetize locally on campus (e.g., fixing a laptop, tutoring a specific module). **UniGig** is a centralized, real-time noticeboard designed specifically for the campus community to post, accept, and manage micro-tasks securely.

**Developed by a 5-person undergraduate IT team.**

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Modular Architecture)
* **Frontend Logic:** Vanilla JavaScript (ES6 Modules)
* **Backend API Server:** Node.js, Express.js (Platform Statistics, Support Tickets, Report Generation)
* **Backend as a Service (BaaS):** Firebase Firestore (Real-time NoSQL Database)
* **Authentication:** Firebase Auth (Email/Password Login)

---

## 🚀 How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   *The Node.js server will start and typically run on `http://localhost:3000`.*

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

---

## 📂 Architecture & File Ownership
This project is built as a **Multi-Page Application (MPA)** with strictly isolated files and a custom Node.js REST API backend to extend functionality.

```text
📁 unigig-repo
│
├── 📁 assets/           # UI images, icons, logos
│
├── 📁 css/              # Modular Stylesheets
│   ├── global.css       # Variables, fonts, navbar (Owner: UI Lead)
│   ├── auth.css         # Login page styling (Owner: Gatekeeper)
│   └── dashboard.css    # Gig feed and profile styling (Owner: UI Lead)
│
├── 📁 js/               # ES6 Modules (MUST use type="module" in HTML)
│   ├── firebase-config.js # Database initialization keys (Owner: Architect)
│   ├── auth.js          # Login/Signup logic (Owner: Gatekeeper)
│   ├── guard.js         # Fetching/posting live gigs (Owner: Data Wrangler)
│   ├── profile.js       # Managing user-specific gigs (Owner: Profile Manager)
│   └── backend-integration.js # Node.js backend hooks
│
├── index.html           # Login & Registration screen
├── dashboard.html       # Main live feed for campus tasks
├── profile.html         # User's personal task management dashboard
├── server.js            # Node.js backend server
└── package.json         # Backend dependencies & scripts
```
