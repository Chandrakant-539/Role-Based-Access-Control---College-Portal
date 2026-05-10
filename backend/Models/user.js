import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },  
    role: { 
        type: String, 
        enum: ['HOD', 'Teacher', 'Student'], 
        default: 'Student' 
    },
    // The "Gatekeeper" field: All signups start as 'false'
    isApproved: { 
        type: Boolean, 
        default: false 
    },
    // Stores the ID of the linked document in the Student, Teacher, or HOD collection
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId 
    }
}, { 
    // This automatically manages createdAt and updatedAt fields for you
    timestamps: true 
});

// Helper method to check if the user is vetted (useful for middleware logic)
userSchema.methods.isActive = function() {
    return this.isApproved === true;
};

// Create the model
const UserModel = mongoose.model('User', userSchema);

// Export it for use in Auth.js and Admin.js
export default UserModel;
