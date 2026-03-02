import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from "../config/emailConfig.js";
import { welcomeTemplate, forgotPasswordTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User Doesn't Exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Register User
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        // Checking if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // Validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save();
        const token = createToken(user._id);

        // Send Welcome Email (Non-blocking)
        sendEmail({
            to: email,
            subject: "Welcome to FlavoHub! 🍕",
            html: welcomeTemplate(name)
        });

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const googleLogin = async (req, res) => {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub } = ticket.getPayload();

        let user = await userModel.findOne({ email });

        if (!user) {
            // Create a new user with a dummy password (they will login via Google anyway)
            // In a real app, you might want a separate flag for oauth users or handle password linking
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(sub + process.env.JWT_SECRET, salt); // Use google ID as base for password

            user = new userModel({
                name: name,
                email: email,
                password: hashedPassword
            })
            await user.save();

            // Send Welcome Email to new Google sign-up users
            sendEmail({
                to: email,
                subject: "Welcome to FlavoHub! 🍕",
                html: welcomeTemplate(name)
            });
        }

        const jwtToken = createToken(user._id);
        res.json({ success: true, token: jwtToken });

    } catch (error) {
        console.error("Google Login Backend Error:", error);
        res.json({ success: false, message: "Google Login Failed: " + error.message });
    }
}

const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();
        const inputEmail = email?.trim();
        const inputPassword = password?.trim();

        console.log(`Admin login attempt for email: ${inputEmail}`);

        if (!adminEmail || !adminPassword) {
            console.error("Admin Login Error: ADMIN_EMAIL or ADMIN_PASSWORD environment variable is not defined.");
            return res.json({ success: false, message: "Server Configuration Error: Missing Admin Credentials" });
        }

        if (inputEmail === adminEmail && inputPassword === adminPassword) {
            const token = jwt.sign({ email: adminEmail }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            console.log(`Admin login failed: Credentials do not match.`);
            res.json({ success: false, message: "Invalid Admin Credentials" });
        }
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.json({ success: false, message: "Error" });
    }
}

const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({});
        res.json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching users" });
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set resetPasswordToken field
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token expiry time (1 hour from now)
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "FlavoHub - Password Reset Request 🔐",
                html: forgotPasswordTemplate(user.name, resetUrl)
            });

            res.json({ success: true, message: "Reset link sent to your email" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.json({ success: false, message: "Email could not be sent" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error processing forgot password" });
    }
}

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        // Hash the token from URL to compare it with the hashed token in DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired token" });
        }

        // Validating password length
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" })
        }

        // Hashing new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error resetting password" });
    }
}

export { loginUser, registerUser, googleLogin, adminLogin, listUsers, forgotPassword, resetPassword };
