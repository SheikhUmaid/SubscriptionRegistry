
import express from "express";

import {
    createDeployment,
    getDeployments,
    deleteDeployment
} from "../controllers/deploymentController.js";

const router = express.Router();

router.post("/", createDeployment);
router.get("/", getDeployments);
router.delete("/:id", deleteDeployment);

export default router;
