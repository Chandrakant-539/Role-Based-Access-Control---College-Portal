import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    // Updated from classId to subject to allow direct display of DSA, IDS, etc.
    subject: { 
        type: String, 
        required: true,
        enum: ["DSA", "IDS", "DM", "CSY", "DA", "CST", "MAT"], // Added your requested subjects
        trim: true 
    },  
    // The Teacher assigned to this specific subject slot
    teacherId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    // Standardizing days for system-wide consistency
    day: { 
        type: String, 
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], 
        required: true 
    },
    // Period/Hour (1 to 8)
    period: { 
        type: Number, 
        required: true,
        min: 1,
        max: 8 
    }, 
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true 
});

/** * --- DATA INTEGRITY FIREWALL (Indexes) ---
 * These ensure the database itself rejects "Impossible" schedules.
 */

// 1. UNIQUE TEACHER CONSTRAINT: One teacher cannot be in two places at once.
// (e.g., Raj cannot teach DSA and DM at Monday 1st Hour)
scheduleSchema.index({ teacherId: 1, day: 1, period: 1 }, { unique: true });

// 2. UNIQUE SUBJECT SLOT CONSTRAINT: One subject hour can only have one teacher.
// (e.g., DSA at Monday 2nd Hour cannot have both Raj and Rajesh)
scheduleSchema.index({ subject: 1, day: 1, period: 1 }, { unique: true });


/**
 * --- PRE-SAVE CONFLICT RESOLUTION ---
 * Performs a final check before writing to the database.
 */
scheduleSchema.pre('save', async function(next) {
    const Schedule = mongoose.model("Schedule");
    
    // Check if this teacher is already booked globally for this day and hour
    const conflict = await Schedule.findOne({
        teacherId: this.teacherId,
        day: this.day,
        period: this.period
    });

    if (conflict && conflict._id.toString() !== this._id.toString()) {
        const err = new Error(
            `Resource Conflict: Teacher is already assigned to ${conflict.subject} during ${this.day} - Period ${this.period}.`
        );
        return next(err);
    }
    next();
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

// Sync indexes immediately
Schedule.createIndexes();

export default Schedule;
