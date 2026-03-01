import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    isFreeDelivery: { type: Boolean, default: false },
    slabs: [
        {
            uptoAmount: { type: Number, required: true },
            deliveryCharge: { type: Number, required: true }
        }
    ]
}, { minimize: false });

const deliveryModel = mongoose.models.delivery || mongoose.model("delivery", deliverySchema);

export default deliveryModel;
