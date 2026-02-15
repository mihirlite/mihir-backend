import notificationModel from "../models/notificationModel.js";
import jwt from "jsonwebtoken";

const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.find({ userId: req.body.userId }).sort({ date: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching notifications" });
    }
}

const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.find({ userId: "admin" }).sort({ date: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching admin notifications" });
    }
}

const markAsRead = async (req, res) => {
    try {
        const { id } = req.body;
        const { token } = req.headers;

        if (!token) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.json({ success: false, message: "Invalid Token" });
        }

        const notification = await notificationModel.findById(id);
        if (!notification) {
            return res.json({ success: false, message: "Notification not found" });
        }

        // Admin can mark any notification read, or user can mark their own
        if (decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD || notification.userId === decoded.id) {
            notification.read = true;
            await notification.save();
            res.json({ success: true, message: "Marked as read" });
        } else {
            res.json({ success: false, message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Internal helper for other controllers
const createNotification = async (userId, message, orderId) => {
    try {
        const notification = new notificationModel({
            userId,
            message,
            orderId
        });
        await notification.save();
    } catch (error) {
        console.log("Notification Error:", error);
    }
}

export { getNotifications, markAsRead, createNotification, getAdminNotifications };
