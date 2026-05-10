import Schedule from "../Models/schedule.js";

const assignTeacher = async (req, res) => {
    try {
        // 1. Destructure using 'subject' instead of 'classId'
        const { subject, teacherId, day, period } = req.body;

        if (!subject || !teacherId || !day || !period) {
            return res.status(400).json({ success: false, message: "All fields are required (Subject, Teacher, Day, Period)!" });
        }

        // 2. TEACHER CONFLICT CHECK
        // Verify this specific teacher isn't already assigned to ANY subject in this slot
        const teacherBusy = await Schedule.findOne({ teacherId, day, period });
        if (teacherBusy) {
            return res.status(409).json({ 
                success: false, 
                message: `Conflict: This teacher is already assigned to ${teacherBusy.subject} in this slot!` 
            });
        }

        // 3. SLOT CONFLICT CHECK
        // Verify that this subject doesn't already have a teacher for this specific hour
        const slotTaken = await Schedule.findOne({ subject, day, period });
        if (slotTaken) {
            return res.status(409).json({ 
                success: false, 
                message: `This ${subject} slot is already filled for ${day} Period ${period}.` 
            });
        }

        // 4. CREATE ASSIGNMENT
        const schedule = await Schedule.create({ 
            subject, // Saving DSA, IDS, etc.
            teacherId, 
            day, 
            period 
        });

        // NOTE: We no longer need to manually update a "Teacher availability" array.
        // The unique indexes in our Schedule model (Schedule.js) handle the security,
        // and our 'Available.js' controller handles the filtering.

        res.status(200).json({ 
            success: true, 
            message: `${subject} assigned to faculty successfully!`, 
            schedule 
        });

    } catch (error) {
        console.error("Assignment Logic Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during resource allocation." 
        });
    }
};

export { assignTeacher };
