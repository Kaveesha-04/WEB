# UniGig: Campus Micro-Task & Freelance Board

## 🌍 The Problem
University students often need quick favors, technical help, or have skills they want to monetize locally on campus (e.g., fixing a laptop, tutoring a specific module, or designing a quick flyer). However, relying on messy WhatsApp groups makes it hard to track, filter, and securely connect for these small, one-off tasks.

## 🛠️ The Solution
**UniGig** is a centralized, real-time noticeboard designed exclusively for the campus community to:
1. **Post Gigs:** Quickly request help for a micro-task or project.
2. **Offer Skills:** Browse open requests and click to accept gigs.
3. **Connect Securely:** Filter tasks by category and connect with peers without broadcasting personal contact info publicly.

## 📂 Project Structure & Naming Conventions
To maintain a clean workflow while integrating our cloud database, we adhere to the following structure:

| Folder/File | Purpose | Naming Convention |
| :--- | :--- | :--- |
| `/assets` | UI images, icons, and logos | `snake_case` (e.g., `hero_banner.jpg`) |
| `/css` | Main styling and layout | `kebab-case` (e.g., `style.css`, `.btn-primary`) |
| `/js` | Core logic and Firebase integration | `camelCase` (e.g., `auth.js`, `app.js`) |
| `index.html` | Dashboard entry point | All lowercase |

## 🚀 Built With
* **HTML5 & CSS3** - Responsive, modern dashboard UI.
* **JavaScript (Vanilla)** - Dynamic DOM manipulation and data rendering.
* **Firebase Authentication** - Secure user login and session management.
* **Firebase Firestore** - Real-time NoSQL database for gig postings and user profiles.

## 👥 The Team
* **Member 1 (Frontend UI/UX):** Designs dashboard layouts, responsive styling, and gig cards.
* **Member 2 (Auth & Routing):** Handles Firebase user registration, login, and protected routes.
* **Member 3 (Database Architect):** Structures Firestore collections and writes read/write security rules.
* **Member 4 (Dynamic DOM Logic):** Writes the JS to fetch live gig data and inject HTML elements.
* **Member 5 (QA & Repo Manager):** Populates test data, manages Git branches, and ensures cross-browser stability.

## ⚙️ How to Run Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/Kaveesha-04/passcheck-tool.git](https://github.com/Kaveesha-04/passcheck-tool.git)
