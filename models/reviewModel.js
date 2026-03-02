import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: String, default: 'general' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    userName: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    date: { type: Date, default: Date.now }
})

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
