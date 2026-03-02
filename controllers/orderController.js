import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { createNotification } from "./notificationController.js";
import { sendEmail } from "../config/emailConfig.js";
import { orderConfirmationTemplate, statusUpdateTemplate, deliveryConfirmationTemplate } from "../utils/emailTemplates.js";
import Stripe from "stripe";
import Razorpay from "razorpay";

// Global variables for payment gateways (initialized with env vars)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 
// const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// placing user order for frontend
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173";

    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            otp: otp
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Trigger Notification
        await createNotification(req.body.userId, `Success! Your order #${newOrder._id.toString().slice(-6)} has been placed.`, newOrder._id);

        // Notify Admin
        await createNotification("admin", `New Order Received! Order #${newOrder._id.toString().slice(-6)}`, newOrder._id);

        // Send Order Confirmation Email
        const user = await userModel.findById(req.body.userId);
        if (user && user.email) {
            await sendEmail({
                to: user.email,
                subject: `Order Confirmed - #${newOrder._id.toString().slice(-6)} 🍔`,
                html: orderConfirmationTemplate(newOrder)
            });
        }

        // Payment Logic Placeholder
        // For now treating as COD or simple success for the base structure
        // In real Razorpay integration, we would create an order on Razorpay here

        res.json({ success: true, session_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}` })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// user orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        const order = await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });

        // Trigger Notification
        await createNotification(order.userId, `Order Update: Your order #${req.body.orderId.slice(-6)} is now ${req.body.status}.`, req.body.orderId);

        // Send Status Update Email
        const user = await userModel.findById(order.userId);
        if (user && user.email) {
            await sendEmail({
                to: user.email,
                subject: `Order Update: ${req.body.status} - #${req.body.orderId.slice(-6)} 🛵`,
                html: statusUpdateTemplate(req.body.orderId, req.body.status)
            });
        }

        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const verifyOtp = async (req, res) => {
    const { orderId, otp } = req.body;
    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        console.log(`Verifying OTP for order ${orderId}: Expected ${order.otp}, Received ${otp}`);

        if (order.otp && order.otp.toString().trim() === otp.toString().trim()) {
            await orderModel.findByIdAndUpdate(orderId, { status: "Delivered", payment: true });

            // Trigger Notification
            await createNotification(order.userId, `Enjoy! Your order #${orderId.slice(-6)} has been delivered.`, orderId);

            // Send Delivery Confirmation Email
            const deliveredUser = await userModel.findById(order.userId);
            if (deliveredUser && deliveredUser.email) {
                await sendEmail({
                    to: deliveredUser.email,
                    subject: `Your Order #${orderId.slice(-6)} Has Been Delivered! ✅`,
                    html: deliveryConfirmationTemplate(orderId, deliveredUser.name)
                });
            }

            res.json({ success: true, message: "OTP Verified. Order Delivered." });
        } else {
            res.json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error verifying OTP" });
    }
}

const getOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, data: order })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, verifyOtp, getOrder }
