
import express from "express";
import { getRenewals, deleteRenewal } from "../controllers/renewalController.js";

const router = express.Router();

router.get("/", getRenewals);
router.delete("/:id", deleteRenewal);

export default router;
