const userSchema = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/MailConfig");

const sanitizeUser = (user) => {
    const userObject = user.toObject ? user.toObject() : user;
    const { password, ...userData } = userObject;
    return userData;
};

const canAccessUser = (requestUser, targetUserId) =>
    requestUser.role === "admin" || requestUser.id === targetUserId.toString();

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

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
            role: role === "admin" ? "admin" : "user"
        });

        res.status(201).json({
            message: "User created successfully",
            user: sanitizeUser(saveUser)
        });

        sendEmail({
            to: saveUser.email,
            subject: "Welcome to VehicleVault",
            text: `Hi ${saveUser.name}, your VehicleVault account has been created successfully.`
        }).catch((emailError) => {
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

        const user = await userSchema.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: sanitizeUser(user)
        });
    } catch (err) {
        res.status(500).json({
            message: "Error while login",
            error: err.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userSchema.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "VehicleVault Password Reset",
            text: `Reset your password using this link: ${resetUrl}`
        });

        res.status(200).json({
            message: "Password reset link sent successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error sending reset email",
            error: err.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await userSchema.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: "Password reset successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error resetting password",
            error: err.message
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
    getUserById,
    updateUser,
    deleteUser
};
