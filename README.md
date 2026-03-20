# 🚀 UniGig: Campus Micro-Task & Freelance Board

## 📖 Project Overview
University students often need quick favors, technical help, or have skills they want to monetize locally on campus (e.g., fixing a laptop, tutoring a specific module). **UniGig** is a centralized, real-time noticeboard designed specifically for the campus community to post, accept, and manage micro-tasks securely.

**Developed by a 5-person undergraduate IT team.**

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Modular Architecture)
* **Logic:** Vanilla JavaScript (ES6 Modules)
* **Backend as a Service (BaaS):** Firebase Firestore (Real-time NoSQL Database)
* **Authentication:** Firebase Auth (Email/Password Login)

---

## 📂 Architecture & File Ownership
To prevent Git merge conflicts and allow all 5 team members to develop in parallel, this project is built as a **Multi-Page Application (MPA)** with strictly isolated files.

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
│   ├── board.js         # Fetching/posting live gigs (Owner: Data Wrangler)
│   └── profile.js       # Managing user-specific gigs (Owner: Profile Manager)
│
├── index.html           # Login & Registration screen
├── dashboard.html       # Main live feed for campus tasks
└── profile.html         # User's personal task management dashboard

```

---
