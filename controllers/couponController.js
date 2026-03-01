import couponModel from "../models/couponModel.js";

// add coupon
const addCoupon = async (req, res) => {
    try {
        const { name, type, value } = req.body;

        if (type === 'percentage' && value > 100) {
            return res.json({ success: false, message: "Percentage cannot exceed 100%" });
        }

        const coupon = new couponModel({
            name,
            type,
            value,
            isActive: true
        });

        await coupon.save();
        res.json({ success: true, message: "Coupon Added" });
    } catch (error) {
        console.error("Add coupon error:", error);
        res.json({ success: false, message: error.code === 11000 ? "Coupon name already exists" : "Error adding coupon" });
    }
}

// list all coupons
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error("List coupons error:", error);
        res.json({ success: false, message: "Error fetching coupons" });
    }
}

// toggle coupon status
const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.body;
        const coupon = await couponModel.findById(id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.json({ success: true, message: `Coupon ${coupon.isActive ? 'Activated' : 'Inactivated'}` });
    } catch (error) {
        console.error("Toggle coupon status error:", error);
        res.json({ success: false, message: "Error toggling status" });
    }
}

// remove coupon
const removeCoupon = async (req, res) => {
    try {
        await couponModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Coupon Removed" });
    } catch (error) {
        console.error("Remove coupon error:", error);
        res.json({ success: false, message: "Error removing coupon" });
    }
}

// verify coupon
const verifyCoupon = async (req, res) => {
    try {
        const { name } = req.body;
        const coupon = await couponModel.findOne({ name });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid Coupon Code" });
        }

        if (!coupon.isActive) {
            return res.json({ success: false, message: "Coupon is currently inactive" });
        }

        res.json({ success: true, message: "Coupon Applied", data: coupon });
    } catch (error) {
        console.error("Verify coupon error:", error);
        res.json({ success: false, message: "Error verifying coupon" });
    }
}

export { addCoupon, listCoupons, toggleCouponStatus, removeCoupon, verifyCoupon }
