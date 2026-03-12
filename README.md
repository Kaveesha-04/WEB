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

## 👥 Team Roles & Responsibilities

1. **The Architect (Project Lead):** Manages GitHub merges, configures Firebase `firebase-config.js`, and writes Firestore Security Rules.
2. **The Gatekeeper:** Owns `index.html` and `auth.js`. Handles user registration, login, and route protection (kicking logged-out users away from the dashboard).
3. **The UI/UX Lead:** Owns the `/css` folder. Designs the responsive grid layouts, gig cards, and dark mode theme.
4. **The Data Wrangler:** Owns `dashboard.html` and `board.js`. Writes the DOM manipulation logic to fetch live data from Firestore and render it to the screen.
5. **The Profile Manager:** Owns `profile.html` and `profile.js`. Writes the logic to query the database for a specific user's posts and handles document deletion.

---

## ⚠️ Development Rules (Must Read for the Team)

1. **Strict File Ownership:** Do not edit a JavaScript or HTML file assigned to someone else without communicating first.
2. **ES6 Modules:** Because we are using Firebase, every JavaScript file must be linked in the HTML using `type="module"`. Example: `<script type="module" src="js/auth.js"></script>`
3. **Local Server Required:** You cannot simply double-click the HTML files to view them. You **must** run the project through a local development server (like the VS Code "Live Server" extension) for the Firebase modules to load correctly.

---

## ⚙️ How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/Kaveesha-04/WEB

```


2. Open the project folder in VS Code.
3. Ensure you have the `firebase-config.js` file set up with the active project keys (request these from the Project Lead).
4. Right-click `index.html` and select **"Open with Live Server"**.
