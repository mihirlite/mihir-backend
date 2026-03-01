import express from "express";
import { addCoupon, listCoupons, toggleCouponStatus, removeCoupon, verifyCoupon } from "../controllers/couponController.js";
import adminAuth from "../middleware/adminAuth.js";

const couponRouter = express.Router();

couponRouter.post("/add", adminAuth, addCoupon);
couponRouter.get("/list", adminAuth, listCoupons);
couponRouter.post("/toggle-status", adminAuth, toggleCouponStatus);
couponRouter.post("/remove", adminAuth, removeCoupon);
couponRouter.post("/verify", verifyCoupon);

export default couponRouter;
