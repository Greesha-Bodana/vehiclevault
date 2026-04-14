const userSchema = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ✅ REGISTER (CREATE)
const registerUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const saveUser = await userSchema.create({
            ...req.body,
            password: hashedPassword
        });

        const { password, ...userData } = saveUser._doc;

        res.status(201).json({
            message: "User created successfully",
            user: userData
        });

    } catch (err) {
        res.status(500).json({
            message: "Error while creating user",
            err
        });
    }
};


// ✅ LOGIN
const loginUser = async (req, res) => {
    try {
        const user = await userSchema.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // 🔐 JWT TOKEN
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const { password, ...userData } = user._doc;

        res.status(200).json({
            message: "Login successful",
            token,
            user: userData
        });

    } catch (err) {
        res.status(500).json({
            message: "Error while login",
            err
        });
    }
};


// ✅ READ ALL USERS
const getUsers = async (req, res) => {
    try {
        const users = await userSchema.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error", err });
    }
};


// ✅ READ ONE USER
const getUserById = async (req, res) => {
    try {
        const user = await userSchema.findById(req.params.id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Error", err });
    }
};


// ✅ UPDATE USER
const updateUser = async (req, res) => {
    try {
        const user = await userSchema.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "User updated",
            user
        });

    } catch (err) {
        res.status(500).json({ message: "Error", err });
    }
};


// ✅ DELETE USER
const deleteUser = async (req, res) => {
    try {
        await userSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User deleted"
        });

    } catch (err) {
        res.status(500).json({ message: "Error", err });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};