import gstChargesModel from "../models/gstChargesModel.js";

const getGSTCharges = async (req, res) => {
    try {
        let settings = await gstChargesModel.findOne();
        if (!settings) {
            settings = await gstChargesModel.create({ gstFixedAmount: 0, chargesSlabs: [] });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching GST & Charges settings" });
    }
}

const updateGSTCharges = async (req, res) => {
    try {
        const { gstFixedAmount, isGstActive, chargesSlabs } = req.body;

        // Sort slabs by uptoAmount in ascending order
        const sortedSlabs = (chargesSlabs || []).sort((a, b) => a.uptoAmount - b.uptoAmount);

        let settings = await gstChargesModel.findOne();
        if (settings) {
            settings.gstFixedAmount = gstFixedAmount;
            settings.isGstActive = isGstActive;
            settings.chargesSlabs = sortedSlabs;
            await settings.save();
        } else {
            settings = await gstChargesModel.create({ gstFixedAmount, isGstActive, chargesSlabs: sortedSlabs });
        }

        res.json({ success: true, message: "GST & Charges updated successfully", data: settings });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating GST & Charges settings" });
    }
}

export { getGSTCharges, updateGSTCharges };
