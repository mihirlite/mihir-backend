import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: String, required: true },
    read: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
})

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default notificationModel;
