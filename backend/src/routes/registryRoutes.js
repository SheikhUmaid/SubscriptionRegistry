
import express from "express";

import { getRegistryStatus } from "../controllers/registryController.js";
import { authenticateDeployment } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/status",
    authenticateDeployment,
    getRegistryStatus
);

export default router;
