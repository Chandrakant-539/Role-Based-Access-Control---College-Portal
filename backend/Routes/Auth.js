import express from 'express'
import { checkuser, getstudents, getTeachers, register } from '../Controllers/Auth.js'
import { login } from '../Controllers/Auth.js'
import { logout } from '../Controllers/Auth.js'
import { isuser } from '../MiddleWare/VerifyToken.js'
import { getTschedule } from '../Controllers/TeacherS.js'
import { getClassSchedule } from '../Controllers/ClassS.js'
// Import the unified schedule logic so students can see it
import { GetAllSchedules } from '../Controllers/Admin.js'

const AuthRoutes = express.Router()

// --- PUBLIC / BASE AUTH ---
AuthRoutes.post('/register', register)
AuthRoutes.post('/login', login)
AuthRoutes.post('/logout', logout)

// --- USER DIRECTORY ---
AuthRoutes.get('/getteachers', getTeachers)
AuthRoutes.get('/getstudents', getstudents)
AuthRoutes.get('/checkuser', isuser, checkuser)

// --- SCHEDULING (Student & Teacher Access) ---

// This fixes the Student "Failed to load global timetable" error
// Students call this via /api/auth/getGlobalSchedules
AuthRoutes.get('/getGlobalSchedules', isuser, GetAllSchedules)

// Individual schedule views
AuthRoutes.get('/teacherS/:tId', isuser, getTschedule)
AuthRoutes.get('/classS/:classId', isuser, getClassSchedule)

export default AuthRoutes
