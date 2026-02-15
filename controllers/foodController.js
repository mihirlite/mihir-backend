import foodModel from "../models/foodModel.js";
import { cloudinary } from "../config/cloudinary.js";
import fs from 'fs';

// add food item
const addFood = async (req, res) => {
    try {
        if (!req.file) {
            console.error("Multer failed to upload file:", req.body);
            return res.json({ success: false, message: "Image upload failed" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: req.file.path, // Cloudinary URL
            veg: req.body.veg === "true"
        })
        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.error("Add food error:", error);
        res.json({ success: false, message: error.message || "Error adding food" })
    }
}

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Handle Cloudinary image deletion
        if (food.image && food.image.includes('cloudinary')) {
            try {
                const publicId = food.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`litefood/${publicId}`);
            } catch (err) {
                console.error("Cloudinary deletion error:", err);
            }
        }
        // Handle legacy local image deletion
        else if (food.image) {
            fs.unlink(`uploads/${food.image}`, () => { });
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" })
    } catch (error) {
        console.error("Remove food error:", error);
        res.json({ success: false, message: error.message || "Error removing food" })
    }
}

export { addFood, listFood, removeFood }
