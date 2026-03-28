# UniGig: Professional Campus Freelance Network
**Final Project Architecture & Implementation Report**

## 1. Executive Summary
UniGig is a centralized, real-time web application designed specifically for the university community. It serves as a micro-task marketplace where students can post, accept, and manage freelance services such as tutoring, web development, and graphic design safely within their campus network. 

To ensure security, real-time performance, and modern development standards, UniGig utilizes a hybrid architectural approach combining a serverless Firebase infrastructure for immediate data handling with a custom Node.js REST API for secure backend processing.

---

## 2. Technology Stack & Architecture

UniGig employs a standard three-tier architecture tailored for modern web applications:

### 2.1 Frontend Presentation Layer
*   **Technologies:** HTML5, CSS3 (Custom Variables & Modern Flexbox/Grid Layouts), Vanilla JavaScript (ES6 Modules).
*   **Design Philosophy:** The interface is built without heavy frameworks to ensure maximum performance and zero overhead. It utilizes a custom CSS design system (`global.css`) to enforce consistent, modern styling, glassy modals, and responsive mobile-first layouts.

### 2.2 Serverless Database & Authentication (Firebase)
*   **Authentication:** Firebase Auth handles user registration and login securely, integrating Google OAuth and strict university email verification.
*   **Database:** Firebase Firestore (NoSQL) is used for real-time reads and writes of Gigs and User profiles. This allows the application feed to update seamlessly without server polling.

### 2.3 Custom Backend API (Node.js Express)
*   **Environment:** A dedicated custom backend built using Node.js and Express.js, hosted independently on Render.
*   **Purpose:** While Firebase handles standard database retrieval, the Node.js API was engineered specifically to handle secure data aggregation, file-system logging, and dynamic file generation.

---

## 3. Core Feature Implementation

### 3.1 Secure User Authentication & Identity
Authentication is handled strictly through the `auth.js` module. Users are required to provide a valid `.lk` or university-tied email address. Passwords are never stored on our servers; they are securely hashed and managed by Google's Firebase Authentication servers, ensuring compliance with modern security standards.

### 3.2 Real-Time Marketplace Feed
The core dashboard (`guard.js`) uses Firestore's snapshot listeners and query tools. Data is retrieved asynchronously and injected into the DOM dynamically. Every "Gig" is tracked by an `authorId`, linking it natively to the user's secure profile.

### 3.3 The Node.js REST API Integration
To fulfill advanced computing requirements and secure data handling, three distinct endpoints were built into the standalone `server.js` Node application:

**A. Live Platform Statistics (`GET /api/stats`)**
The frontend dashboard accesses real-time platform statistics (such as total users and completed tasks). The frontend efficiently uses Firebase's `getCountFromServer()` to aggregate this data natively without downloading heavy document payloads, relying on the Node API only as a fallback cache.

**B. Secure Admin Ticketing (`POST /api/contact`)**
When a user utilizes the "Message Admin" feature, the frontend compiles the message payload and executes a `POST` request to the Node server. Because email transmission directly from the client browser exposes API keys, the Node server intercepts this request, assigns a secure transaction UUID and timestamp, and writes the data to a local server log file (`server_logs/support_tickets.json`).

**C. Dynamic Report Generation (`POST /api/download-report`)**
Users can request a personalized, downloadable summary of their freelance activity. Instead of relying on the browser to generate files, the frontend submits the user's raw gig history to the Node backend. The Express server processes the data, dynamically formats a custom `.txt` summary document on the disk, and streams the file securely back to the client initiating an automatic download.

---

## 4. Conclusion
UniGig demonstrates a robust understanding of full-stack web development. By blending standard frontend web technologies with cutting-edge serverless database solutions (Firebase) and a custom microservice backend (Node.js/Express), the platform achieves high scalability, exceptional load speeds, and strict data security.
