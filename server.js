import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import foodRouter from './routes/foodRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import couponRouter from './routes/couponRoute.js';
import deliveryRouter from './routes/deliveryRoute.js';
import gstChargesRouter from './routes/gstChargesRoute.js';

// App Config
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// API Endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'))
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/review", reviewRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/gst-charges", gstChargesRouter);
app.get('/', (req, res) => {
    res.send('API Working');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
