import jwt from 'jsonwebtoken';
import UserModel from '../Models/user.js';

/**
 * Middleware: isAdmin (Protects HOD-only routes)
 * Enforces Role-Based Access Control + Approval Status
 */
const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // 1. Check if the user is an HOD
        if (user.role !== 'HOD') {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Administrative privileges required." 
            });
        }

        // 2. Check if the HOD account itself is vetted/approved
        // This prevents an unapproved user from bypassing the "Waiting Room" via API tools
        if (!user.isApproved) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Your HOD account is awaiting verification by the system administrator." 
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Admin Middleware Error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired, please login again" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token, authorization denied" });
        }
        res.status(500).json({ message: "Internal Server Error during verification" });
    }
};

/**
 * Middleware: isuser (Protects common authenticated routes)
 * Validates identity but allows unapproved users to access basic profile/status data
 */
const isuser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // We attach the full user object so controllers can check 'user.isApproved' 
        // to decide whether to show a "Waiting Room" message or actual data.
        req.user = user;
        next();

    } catch (error) {
        console.error("User Middleware Error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired, please login again" });
        }
        res.status(500).json({ message: "Internal Server Error during verification" });
    }
};

export { isAdmin, isuser };
