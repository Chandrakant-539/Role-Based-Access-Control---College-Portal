import express from 'express';
// Import the controller functions from your Admin.js controller file
import { 
    getUser, 
    upgradeUser, 
    deleteUser, 
    GetAllSchedules 
} from '../Controllers/Admin.js'; 
import { isAdmin } from '../MiddleWare/VerifyToken.js';
import { getAvailableTeachers } from '../Controllers/Available.js';
import { assignTeacher } from '../Controllers/AssignS.js';
import { deleteSchedule } from '../Controllers/DeleteS.js';
import { getClassSchedule } from '../Controllers/ViewS.js';

const AuthAdmin = express.Router();

/**
 * --- USER MANAGEMENT ---
 */
AuthAdmin.get('/getuser', isAdmin, getUser);
AuthAdmin.post('/upgrade', isAdmin, upgradeUser); 
AuthAdmin.delete('/delete/:id', isAdmin, deleteUser);

/**
 * --- SCHEDULING & RESOURCE ALLOCATION ---
 */

// This is the specific route that fixes the "Error fetching unified timetable"
AuthAdmin.get('/getallSchedules', isAdmin, GetAllSchedules);

AuthAdmin.get('/available', isAdmin, getAvailableTeachers);
AuthAdmin.post('/assignS', isAdmin, assignTeacher);
AuthAdmin.post('/deleteS/:id', isAdmin, deleteSchedule);
AuthAdmin.get('/classS/:classId', isAdmin, getClassSchedule);

// --- CRITICAL FIX ---
// This line allows server.js to use: import AuthAdmin from './Routes/AdminRoute.js'
export default AuthAdmin;
