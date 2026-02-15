import express from 'express';
import { loginUser, registerUser, googleLogin, adminLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleLogin);
userRouter.post("/admin-login", adminLogin);

export default userRouter;
