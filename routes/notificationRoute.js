import express from 'express';
import { getNotifications, markAsRead, getAdminNotifications } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const notificationRouter = express.Router();

notificationRouter.post("/user", authMiddleware, getNotifications);
notificationRouter.post("/read", markAsRead);
notificationRouter.post("/admin", adminAuth, getAdminNotifications);

export default notificationRouter;
