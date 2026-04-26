const userSchema = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSend = require("../utils/MailUtil");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const RESET_LINK_BASE = process.env.FRONTEND_URL || "http://localhost:5173";

const sanitizeUser = (user) => {
    const userObject = user.toObject ? user.toObject() : user;
    const { password, resetPasswordToken, resetPasswordExpire, ...userData } = userObject;
    return userData;
};

const canAccessUser = (requestUser, targetUserId) =>
    requestUser.role === "admin" || requestUser.id === targetUserId.toString();

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await userSchema.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const saveUser = await userSchema.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profileImage: req.body.profileImage ? req.body.profileImage.trim() : ""
        });

        res.status(201).json({
            message: "User created successfully",
            data: sanitizeUser(saveUser)
        });

        mailSend(
            saveUser.email,
            "Welcome to VehicleVault",
            `Hi ${saveUser.name}, your VehicleVault account has been created successfully.`,
            `<p>Hi ${saveUser.name},</p><p>Your VehicleVault account has been created successfully.</p>`
        ).catch((emailError) => {
            console.log("Welcome email skipped:", emailError.message);
        });
    } catch (err) {
        res.status(500).json({
            message: "Error while creating user",
            error: err.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const foundUserFromEmail = await userSchema.findOne({ email: email.toLowerCase().trim() });

        if (!foundUserFromEmail) {
            return res.status(404).json({ message: "User not found." });
        }

        const isPasswordMatched = await bcrypt.compare(password, foundUserFromEmail.password);

        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Update last login time
        foundUserFromEmail.lastLogin = new Date();
        await foundUserFromEmail.save();

        const token = jwt.sign(
            {
                id: foundUserFromEmail._id.toString(),
                _id: foundUserFromEmail._id.toString(),
                role: foundUserFromEmail.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login Success",
            token,
            role: foundUserFromEmail.role,
            data: sanitizeUser(foundUserFromEmail)
        });
    } catch (err) {
        res.status(500).json({
            message: "Error while logging in",
            error: err.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        const foundUserFromEmail = await userSchema.findOne({ email: email.toLowerCase().trim() });

        if (!foundUserFromEmail) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const token = jwt.sign(
            { _id: foundUserFromEmail._id, email: foundUserFromEmail.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        const url = `${RESET_LINK_BASE}/reset-password/${token}`;
        const mailtext = `<html><p>Click the link below to reset your password:</p><a href="${url}">${url}</a></html>`;

        await mailSend(
            foundUserFromEmail.email,
            "Reset Password Link",
            `Reset your password using this link: ${url}`,
            mailtext
        );

        res.status(200).json({
            message: "Reset link has been sent to your email"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error while sending reset link",
            error: err.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const token = req.params.token;

        if (!newPassword) {
            return res.status(400).json({
                message: "New password is required."
            });
        }

        const decodedUser = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await userSchema.findByIdAndUpdate(decodedUser._id, { password: hashedPassword });

        res.status(200).json({
            message: "Password reset successfully !!"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error..",
            err: err.message
        });
    }
};

const getUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can view all users" });
        }

        const users = await userSchema.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

const getActiveUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can view active users" });
        }

        // Get users who logged in within the last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = await userSchema.find({
            lastLogin: { $gte: last24Hours }
        }).select("-password").sort({ lastLogin: -1 });

        res.status(200).json({
            count: activeUsers.length,
            users: activeUsers
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching active users", error: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        if (!canAccessUser(req.user, req.params.id)) {
            return res.status(403).json({ message: "You are not allowed to view this user" });
        }

        const user = await userSchema.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        if (!canAccessUser(req.user, req.params.id)) {
            return res.status(403).json({ message: "You are not allowed to update this user" });
        }

        const updates = { ...req.body };

        if (updates.email) {
            updates.email = updates.email.toLowerCase().trim();

            const existingUser = await userSchema.findOne({
                email: updates.email,
                _id: { $ne: req.params.id }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Another user already exists with this email"
                });
            }
        }

        if (updates.name) {
            updates.name = updates.name.trim();
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        if (updates.role && req.user.role !== "admin") {
            delete updates.role;
        }

        const user = await userSchema.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User updated",
            user
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating user", error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!canAccessUser(req.user, req.params.id)) {
            return res.status(403).json({ message: "You are not allowed to delete this user" });
        }

        const user = await userSchema.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User deleted"
        });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getUsers,
    getActiveUsers,
    getUserById,
    updateUser,
    deleteUser
};
