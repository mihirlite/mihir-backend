import express from "express";
import { getDeliverySettings, updateDeliverySettings } from "../controllers/deliveryController.js";
import adminAuth from "../middleware/adminAuth.js";

const deliveryRouter = express.Router();

deliveryRouter.get("/get", getDeliverySettings);
deliveryRouter.post("/update", adminAuth, updateDeliverySettings);

export default deliveryRouter;
