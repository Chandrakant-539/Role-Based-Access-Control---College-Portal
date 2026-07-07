🛡️RBAC: Next-Gen University Resource Portal
RBAC (Role-Based Access Control) is not just a timetable app—it's a high-security administrative engine. Built to solve the "Time Paradox" problem in university departments, it ensures that faculty, subjects, and students are perfectly synchronized under a Zero-Trust architecture.

🎮 The "Interactive" Experience
🗝️ Three Perspectives, One System
The HOD (The Architect): A command-and-control dashboard to approve new users, manage faculty "Waiting Rooms," and live-assign subjects like DSA and CSY to the grid.

The Teacher (The Operator): A personalized view of their academic shift. No more confusion on where to be and when.

The Student (The Beneficiary): A real-time, read-only window into the department's pulse.

⚡ Smart Logic Features
Conflict Firewall: The system mathematically prevents a teacher from being assigned to two different places at the same time.

Dynamic Discovery: When assigning a class, the system live-filters the database to show only the faculty who are actually free.

Soft Deletions & Cleanups: Removing a user automatically scrubs their associated schedules, keeping the database "Lean and Green."

🛠️ System Blueprint
🏗️ Architecture Flow
The system uses a Middleware-First approach. Every request is intercepted and scrutinized:

Identity Check: Is the JWT valid?

Approval Check: Is this user verified by the HOD?

Role Check: Does a "Student" have any business hitting an /admin endpoint? (The answer is always a hard 403 Forbidden).

🗄️ Database Strategy: The Compound Index
We don't rely on frontend logic for security. We use Database-Level Constraints:

JavaScript
// The "Secret Sauce" in our Mongoose Model
scheduleSchema.index({ teacherId: 1, day: 1, period: 1 }, { unique: true });
This ensures that even if a hacker tries to bypass the UI, the MongoDB engine itself will reject a double-booking.

🚀 One-Click Setup
1. Clone & Install
Bash
git clone [https://github.com/yourusername/RBAC-Portal.git](https://github.com/Chandrakant-539/Role-Based-Access-Control---College-Portal.git)
cd RBAC-Portal && npm install && cd frontend && npm install
2. Configure the Engine (.env)
Code snippet
PORT=5000
MONGODB_URL=your_secure_uri
JWT_SECRET=your_ultra_secret_key
3. Ignition
Bash
# In Root
npm start 
# In Frontend
npm run dev
🛡️ Zero-Trust Certification
This project was developed with the principles of the Zero-Trust Certified Associate (ZTCA).

Never Trust, Always Verify.

Least Privilege Access.

Assume Breach Logic.
