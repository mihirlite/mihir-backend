import express from "express"
import { getGSTCharges, updateGSTCharges } from "../controllers/gstChargesController.js";
import adminAuth from "../middleware/adminAuth.js";

const gstChargesRouter = express.Router();

gstChargesRouter.get("/get", getGSTCharges);
gstChargesRouter.post("/update", adminAuth, updateGSTCharges);

export default gstChargesRouter;
