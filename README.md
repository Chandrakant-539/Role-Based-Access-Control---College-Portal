University Resource Management & RBAC System
A modern, full-stack Role-Based Access Control (RBAC) application designed for university departments to manage academic schedules and faculty allocation efficiently.

🚀 Key Features
Advanced RBAC Security: Granular access control for three distinct roles: HOD (Admin), Teacher, and Student.

Zero-Trust Waitroom: New registrants are placed in a "Waiting Room" and must be manually approved/verified by the HOD before accessing the system.

Unified Departmental Timetable: A global 8-hour grid that synchronizes assignments across all user roles in real-time.

Intelligent Resource Allocation:

Prevents "Time Paradoxes" (Teachers cannot be in two places at once).

Filters available faculty based on real-time schedule gaps.

Subject-Centric Logic: Specifically designed for core CS modules like DSA, IDS, DM, CSY, and DA.

🛠️ Tech Stack
Frontend
React.js (Vite): For a fast, reactive User Interface.

Tailwind CSS & Framer Motion: For modern styling and smooth animations.

Redux Toolkit: To manage global authentication and user states.

Axios: For secure, interceptor-based API communication.

Backend
Node.js & Express: Scalable server architecture.

MongoDB & Mongoose: NoSQL database with strict schema validation and unique indexing.

JWT (JSON Web Tokens): Secure, cookie-based session management.

Bcrypt.js: Industry-standard password hashing.

🏗️ System Architecture
The system operates on a Single Source of Truth model where the Schedule collection dictates the availability of resources across the department.

Data Flow Logic
HOD selects a Subject (e.g., DSA) and a Time Slot (e.g., Monday Hour 1).

The system queries the Schedules collection to find which Teachers are currently unassigned.

Upon assignment, a Unique Compound Index in MongoDB ensures that no other subject can claim that Teacher or that Time Slot simultaneously.

The Student Dashboard automatically pulls the updated global state via a secure API endpoint.