import mongoose from "mongoose";

const gstChargesSchema = new mongoose.Schema({
    gstFixedAmount: { type: Number, default: 0 },
    isGstActive: { type: Boolean, default: true },
    chargesSlabs: [
        {
            uptoAmount: { type: Number, required: true },
            charge: { type: Number, required: true }
        }
    ]
});

const gstChargesModel = mongoose.models.gstCharges || mongoose.model("gstCharges", gstChargesSchema);

export default gstChargesModel;
