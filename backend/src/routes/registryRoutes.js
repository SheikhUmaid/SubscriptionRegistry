
import express from "express";

import { getRegistryStatus } from "../controllers/registryController.js";
import {
    getPlanOptions,
    createPlanRequest
} from "../controllers/planRequestController.js";
import { authenticateDeployment } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/status",
    authenticateDeployment,
    getRegistryStatus
);

// Plan change / renewal requests from the venue's admin panel
router.get("/plans", authenticateDeployment, getPlanOptions);
router.post("/plan-requests", authenticateDeployment, createPlanRequest);

export default router;
