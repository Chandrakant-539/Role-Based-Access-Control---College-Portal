import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import DbCon from './Utils/db.js';
import AuthRoutes from './Routes/Auth.js';
import AuthAdmin from './Routes/AdminRoute.js'; // Ensure this filename is exactly AdminRoute.js

// Initialize the database connection
DbCon();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173" 
}));

app.use(express.json());
app.use(cookieparser());

// --- ROUTES ---

// Auth routes (Login, Signup, Logout, Teacher/Student Schedules)
app.use('/api/auth', AuthRoutes);

// Admin routes (User Management, Unified Schedules, available teachers)
// This mounts AuthAdmin.get('/getallSchedules') to http://localhost:5000/api/admin/getallSchedules
app.use('/api/admin', AuthAdmin);

// Health Check
app.get('/', (req, res) => {
    res.status(200).send('RBAC Backend Server is Operational');
});

// Start Server
app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🛡️  Admin Routes: Mounted at /api/admin`);
    console.log(`🔑 Auth Routes:  Mounted at /api/auth`);
    console.log(`-----------------------------------------------`);
});
