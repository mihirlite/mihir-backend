import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { addReview, getReviews } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/list", getReviews);

export default reviewRouter;
