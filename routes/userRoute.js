import express from 'express';
import { loginUser, registerUser, googleLogin, adminLogin, listUsers, forgotPassword, resetPassword } from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleLogin);
userRouter.post("/admin-login", adminLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/list", adminAuth, listUsers);

export default userRouter;
