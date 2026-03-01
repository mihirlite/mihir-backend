import deliveryModel from "../models/deliveryModel.js";

// get delivery settings
const getDeliverySettings = async (req, res) => {
    try {
        let settings = await deliveryModel.findOne({});
        if (!settings) {
            settings = new deliveryModel({ isFreeDelivery: false, slabs: [] });
            await settings.save();
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching delivery settings" });
    }
}

// update delivery settings
const updateDeliverySettings = async (req, res) => {
    try {
        const { isFreeDelivery, slabs } = req.body;

        // sort slabs by uptoAmount ascending
        const sortedSlabs = slabs.sort((a, b) => a.uptoAmount - b.uptoAmount);

        let settings = await deliveryModel.findOne({});
        if (settings) {
            settings.isFreeDelivery = isFreeDelivery;
            settings.slabs = sortedSlabs;
            await settings.save();
        } else {
            settings = new deliveryModel({ isFreeDelivery, slabs: sortedSlabs });
            await settings.save();
        }
        res.json({ success: true, message: "Delivery settings updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating delivery settings" });
    }
}

export { getDeliverySettings, updateDeliverySettings };
