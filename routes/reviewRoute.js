import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { addReview, getReviews, getAllReviews, updateReviewStatus, removeReview } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/list", getReviews);
reviewRouter.get("/admin-list", adminAuth, getAllReviews);
reviewRouter.post("/update-status", adminAuth, updateReviewStatus);
reviewRouter.post("/remove", adminAuth, removeReview);

export default reviewRouter;
