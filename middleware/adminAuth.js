import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized, Login Again" });
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        if (token_decode.email !== process.env.ADMIN_EMAIL?.trim()) {
            return res.json({ success: false, message: "Not Authorized, Login Again" });
        }
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.json({ success: false, message: error.message });
    }
}

export default adminAuth;
