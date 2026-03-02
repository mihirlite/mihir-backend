import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

const addReview = async (req, res) => {
    try {
        const { orderId, rating, comment, userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if user already submitted a review for this orderId (or general)
        const existing = await reviewModel.findOne({ userId, orderId: orderId || 'general' });
        if (existing) {
            return res.json({ success: false, message: "You have already submitted a review." });
        }

        const newReview = new reviewModel({
            userId,
            orderId: orderId || 'general',
            rating,
            comment,
            userName: user.name || "Anonymous"
        });

        await newReview.save();
        res.json({ success: true, message: "Thank you for your feedback! 🎉" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding review" });
    }
}

const getReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ status: 'approved' });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
}

// Admin only: list all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({}).sort({ date: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Admin only: approve/reject review
const updateReviewStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        await reviewModel.findByIdAndUpdate(id, { status });
        res.json({ success: true, message: `Review ${status}` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Admin only: delete review
const removeReview = async (req, res) => {
    try {
        await reviewModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting review" });
    }
}

export { addReview, getReviews, getAllReviews, updateReviewStatus, removeReview };
