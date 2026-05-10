import Teacher from "../Models/teachers.js";
import UserModel from "../Models/user.js";
import Schedule from "../Models/schedule.js";

const getAvailableTeachers = async (req, res) => {
    try {
        const { day, period } = req.query;

        if (!day || !period) {
            return res.status(400).json({ success: false, message: "Day and period are required." });
        }

        // 1. Find all teachers who are ALREADY assigned to a subject in this slot
        const busySchedules = await Schedule.find({ 
            day: day, 
            period: Number(period) 
        }).select('teacherId');

        // Extract the IDs of busy teachers
        const busyTeacherIds = busySchedules.map(s => s.teacherId.toString());

        // 2. Find all Approved Teachers in the system
        const allTeachers = await UserModel.find(
            { role: 'Teacher', isApproved: true },
            { _id: 1, name: 1 }
        );

        // 3. Filter: Keep only teachers who are NOT in the busyTeacherIds list
        const availableTeachers = allTeachers.filter(
            (teacher) => !busyTeacherIds.includes(teacher._id.toString())
        );

        if (availableTeachers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No faculty available for this time slot.",
                data: [] 
            });
        }

        res.status(200).json({
            success: true,
            message: "Available faculty retrieved successfully.",
            data: availableTeachers // This goes directly to your dropdown
        });
    } catch (error) {
        console.error("Availability Logic Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error during availability check." });
    }
};

export { getAvailableTeachers };
