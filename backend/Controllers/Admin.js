import UserModel from "../Models/user.js";
import Student from "../Models/students.js";
import Teacher from "../Models/teachers.js";
import HOD from "../Models/hod.js";
import Schedule from "../Models/schedule.js"; // Ensure this import is here!

/**
 * NEW: Fetch UNIFIED Timetable for HOD
 * This is the function your Route is looking for!
 */
const GetAllSchedules = async (req, res) => {
    try {
        // Populate teacherId to get the names for the frontend grid
        const schedules = await Schedule.find().populate("teacherId", "name");
        
        res.status(200).json({
            success: true,
            schedules
        });
    } catch (error) {
        console.error("Fetch All Schedules Error:", error);
        res.status(500).json({ success: false, message: "Server Error: Could not fetch timetable" });
    }
};

/**
 * Fetch all users for the dashboard
 */
const getUser = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

/**
 * Handle Role Promotion and Admin Approval
 */
const upgradeUser = async (req, res) => {
    try {
        const { userId, newRole, department } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Logic for approval and role migration
        user.role = newRole;
        user.isApproved = true; 

        if (newRole === "Teacher") {
            await Student.findOneAndDelete({ userId: user._id });
            
            // Setup 8-period initial availability
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            const available = days.map(day => ({
                day,
                periods: Array.from({ length: 8 }, (_, i) => ({ period: i + 1, isAvailable: true }))
            }));

            const teacherData = await Teacher.create({
                userId: user._id,
                department: department || "SCSE",
                available
            });
            user.referenceId = teacherData._id;
        } 
        else if (newRole === "HOD") {
            await Student.findOneAndDelete({ userId: user._id });
            await Teacher.findOneAndDelete({ userId: user._id });
            const hodData = await HOD.create({ userId: user._id, department: department || "SCSE" });
            user.referenceId = hodData._id;
        }

        await user.save();
        res.status(200).json({ success: true, message: `User approved as ${newRole}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Approval failed" });
    }
};

/**
 * Delete User and cleanup
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await Student.findOneAndDelete({ userId: id });
        await Teacher.findOneAndDelete({ userId: id });
        await HOD.findOneAndDelete({ userId: id });
        await Schedule.deleteMany({ teacherId: id }); // Cleanup their classes too
        await UserModel.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

// CRITICAL: Ensure GetAllSchedules is included in the export!
export { getUser, upgradeUser, deleteUser, GetAllSchedules };
