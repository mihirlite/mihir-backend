import foodModel from "../models/foodModel.js";
import { cloudinary } from "../config/cloudinary.js";
import fs from 'fs';

// add food item
const addFood = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            console.error("Multer failed to upload files:", req.body);
            return res.json({ success: false, message: "Image upload failed" });
        }

        const imagePaths = req.files.map(file => file.path);

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: imagePaths, // Cloudinary URLs array
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

// get single food item
const getFoodById = async (req, res) => {
    try {
        const food = await foodModel.findById(req.query.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }
        res.json({ success: true, data: food })
    } catch (error) {
        console.error("Get food error:", error);
        res.json({ success: false, message: error.message || "Error fetching food" })
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Handle Cloudinary/Local image deletion for all images
        if (food.image) {
            const imagesToDelete = Array.isArray(food.image) ? food.image : [food.image];
            for (const img of imagesToDelete) {
                if (img.includes('cloudinary')) {
                    try {
                        const publicId = img.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(`litefood/${publicId}`);
                    } catch (err) {
                        console.error("Cloudinary deletion error:", err);
                    }
                } else {
                    fs.unlink(`uploads/${img}`, () => { });
                }
            }
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" })
    } catch (error) {
        console.error("Remove food error:", error);
        res.json({ success: false, message: error.message || "Error removing food" })
    }
}

// update food item
const updateFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        let imagePaths = food.image;
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary/Local if they exist
            if (food.image) {
                const imagesToDelete = Array.isArray(food.image) ? food.image : [food.image];
                for (const img of imagesToDelete) {
                    if (img.includes('cloudinary')) {
                        try {
                            const publicId = img.split('/').pop().split('.')[0];
                            await cloudinary.uploader.destroy(`litefood/${publicId}`);
                        } catch (err) {
                            console.error("Cloudinary deletion error:", err);
                        }
                    } else {
                        fs.unlink(`uploads/${img}`, () => { });
                    }
                }
            }
            imagePaths = req.files.map(file => file.path);
        }

        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            veg: req.body.veg === "true",
            image: imagePaths
        }

        await foodModel.findByIdAndUpdate(req.body.id, updateData);
        res.json({ success: true, message: "Food Updated" })
    } catch (error) {
        console.error("Update food error:", error);
        res.json({ success: false, message: error.message || "Error updating food" })
    }
}

export { addFood, listFood, removeFood, updateFood, getFoodById }
