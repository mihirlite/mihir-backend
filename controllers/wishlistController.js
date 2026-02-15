import userModel from "../models/userModel.js";

// add items to user wishlist
const addToWishlist = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let wishlistData = await userData.wishlistData;
        if (!wishlistData[req.body.itemId]) {
            wishlistData[req.body.itemId] = 1;
        }
        // distinct from cart, we probably just want boolean existence, but keeping map structure for consistency/extensibility
        await userModel.findByIdAndUpdate(req.body.userId, { wishlistData });
        res.json({ success: true, message: "Added To Wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// remove items from user wishlist
const removeFromWishlist = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let wishlistData = await userData.wishlistData;
        if (wishlistData[req.body.itemId] > 0) {
            delete wishlistData[req.body.itemId];
        }
        await userModel.findByIdAndUpdate(req.body.userId, { wishlistData });
        res.json({ success: true, message: "Removed From Wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// fetch user wishlist data
const getWishlist = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let wishlistData = await userData.wishlistData;
        res.json({ success: true, wishlistData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

export { addToWishlist, removeFromWishlist, getWishlist }
