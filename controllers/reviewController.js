import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

const addReview = async (req, res) => {
    try {
        const { orderId, rating, comment, userId } = req.body;

        const user = await userModel.findById(userId);

        const newReview = new reviewModel({
            userId,
            orderId,
            rating,
            comment,
            userName: user.name || "Anonymous"
        });

        await newReview.save();
        res.json({ success: true, message: "Review added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding review" });
    }
}

const getReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({});
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
}

export { addReview, getReviews };
