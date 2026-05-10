import UserModel from "../Models/user.js";
import Teacher from "../Models/teachers.js";
import HOD from "../Models/hod.js";
import Student from "../Models/students.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        const isExist = await UserModel.findOne({ email });
        if (isExist) {
            return res.status(409).json({ success: false, message: "User Already Exists!" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            role: "Student",
            isApproved: false 
        });

        await newUser.save();

        const newStudent = await Student.create({
            userId: newUser._id
        });

        newUser.referenceId = newStudent._id;
        await newUser.save();

        res.status(200).json({ 
            success: true, 
            message: "Registration successful. Please wait for HOD approval.", 
            user: newUser 
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { userId, newRole, department } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const oldRole = user.role;
        user.role = newRole;
        user.isApproved = true;

        if (oldRole === "Student" && newRole === "Teacher") {
            await Student.findOneAndDelete({ userId: user._id });
            
            const available = [
                { day: "M", periods: [{ period: 1, isAvailable: true }, { period: 2, isAvailable: true }, { period: 3, isAvailable: true }, { period: 4, isAvailable: true }] },
                { day: "T", periods: [{ period: 1, isAvailable: true }, { period: 2, isAvailable: true }, { period: 3, isAvailable: true }, { period: 4, isAvailable: true }] },
                { day: "W", periods: [{ period: 1, isAvailable: true }, { period: 2, isAvailable: true }, { period: 3, isAvailable: true }, { period: 4, isAvailable: true }] },
                { day: "Th", periods: [{ period: 1, isAvailable: true }, { period: 2, isAvailable: true }, { period: 3, isAvailable: true }, { period: 4, isAvailable: true }] },
                { day: "F", periods: [{ period: 1, isAvailable: true }, { period: 2, isAvailable: true }, { period: 3, isAvailable: true }, { period: 4, isAvailable: true }] }
            ];

            const newTeacher = await Teacher.create({
                userId: user._id,
                department: department || "SCSE",
                available
            });
            user.referenceId = newTeacher._id;
        }

        await user.save();
        res.status(200).json({ success: true, message: `User successfully upgraded to ${newRole}` });
    } catch (error) {
        console.error("Upgrade Error:", error);
        res.status(500).json({ success: false, message: "Failed to update user role" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User Does Not Exist" });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid Password" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.SECRETKEY, 
            { expiresIn: "1h" }
        );

        // --- UPDATED COOKIE SETTINGS FOR LOCALHOST ---
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to false for HTTP development on localhost
            sameSite: "Lax", // "Lax" is better for local testing
            maxAge: 3600000, 
        });

        res.status(200).json({ success: true, message: "Logged In Successfully", user, token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });
        res.status(200).json({ success: true, message: "Logged Out Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
        console.error(error);
    }
};

const checkuser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log(error);
    }
};

const getTeachers = async (req, res) => {
    try {
        const teachers = await UserModel.find({ role: 'Teacher' });
        if (teachers.length === 0) {
            return res.status(200).json({ message: "No Teacher found." });
        }
        res.status(200).json({ teachers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
};

const getstudents = async (req, res) => {
    try {
        const students = await UserModel.find({ role: 'Student' });
        if (students.length === 0) {
            return res.status(200).json({ message: "No Students found." });
        }
        res.status(200).json({ students });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
};

export { register, login, logout, checkuser, getTeachers, getstudents, updateUserRole };
