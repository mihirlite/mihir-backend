import express from 'express';
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, verifyOtp, getOrder, phonepeCallback, phonepeStatusCheck } from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/detail", authMiddleware, getOrder);
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/verify-otp", adminAuth, verifyOtp);
orderRouter.post("/callback", phonepeCallback);
orderRouter.post("/status-check", phonepeStatusCheck);

export default orderRouter;
