import express from 'express';
import { addFood, listFood, removeFood, updateFood, getFoodById } from '../controllers/foodController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';
import { storage } from '../config/cloudinary.js';

const foodRouter = express.Router();

const upload = multer({ storage: storage })

foodRouter.post("/add", adminAuth, upload.array("image", 4), addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", adminAuth, removeFood);
foodRouter.post("/update", adminAuth, upload.array("image", 4), updateFood);
foodRouter.get("/get-item", getFoodById);

export default foodRouter;
