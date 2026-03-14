import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { createNotification } from "./notificationController.js";
import { sendEmail } from "../config/emailConfig.js";
import { orderConfirmationTemplate, statusUpdateTemplate, deliveryConfirmationTemplate } from "../utils/emailTemplates.js";
import axios from "axios";
import crypto from "crypto";
import Stripe from "stripe";
import Razorpay from "razorpay";

// PhonePe Configuration
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_API_URL = process.env.PHONEPE_API_URL;
const PHONEPE_STATUS_API_URL = process.env.PHONEPE_STATUS_API_URL;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// placing user order for frontend
const placeOrder = async (req, res) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const merchantTransactionId = "MT" + Date.now() + Math.floor(Math.random() * 1000);

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            otp: otp,
            merchantTransactionId: merchantTransactionId
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // PhonePe Payment Payload
        const data = {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.userId,
            amount: req.body.amount * 100, // Amount in paise
            redirectUrl: `${FRONTEND_URL}/verify?orderId=${newOrder._id}`,
            redirectMode: "REDIRECT",
            callbackUrl: `${BACKEND_URL}/api/order/callback`,
            mobileNumber: req.body.address.phone,
            paymentInstrument: {
                type: "PAY_PAGE"
            },
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const string = payloadMain + "/pg/v1/pay" + PHONEPE_SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + PHONEPE_SALT_INDEX;

        const options = {
            method: 'POST',
            url: PHONEPE_API_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);

        if (response.data.success) {
            const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
            res.json({ success: true, session_url: redirectUrl });
        } else {
            res.json({ success: false, message: "Payment initiation failed" });
        }

    } catch (error) {
        console.log("PhonePe Error:", error.response?.data || error.message);
        res.json({ success: false, message: "Error" })
    }
}

const phonepeCallback = async (req, res) => {
    try {
        const { response } = req.body;
        const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
        const jsonResponse = JSON.parse(decodedResponse);

        const { merchantTransactionId, success, code } = jsonResponse;

        if (success && code === "PAYMENT_SUCCESS") {
            const order = await orderModel.findOneAndUpdate(
                { merchantTransactionId: merchantTransactionId },
                { payment: true, paymentResponse: jsonResponse }
            );

            if (order) {
                // Trigger success notifications
                await createNotification(order.userId, `Success! Your payment for order #${order._id.toString().slice(-6)} has been received.`, order._id);
            }
        } else {
            console.log(`Payment failed for transaction: ${merchantTransactionId}`);
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).send("Error");
    }
}

const phonepeStatusCheck = async (req, res) => {
    const { orderId } = req.body;
    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        const merchantTransactionId = order.merchantTransactionId;
        const string = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}` + PHONEPE_SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + PHONEPE_SALT_INDEX;

        const options = {
            method: 'GET',
            url: `${PHONEPE_STATUS_API_URL}/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID
            }
        };

        const response = await axios.request(options);

        if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true, paymentResponse: response.data });
            res.json({ success: true, message: "Paid" });
        } else {
            res.json({ success: false, message: response.data.message || "Not Paid" });
        }
    } catch (error) {
        console.error("Status Check Error:", error.response?.data || error.message);
        res.json({ success: false, message: "Error checking status" });
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

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, verifyOtp, getOrder, phonepeCallback, phonepeStatusCheck }
