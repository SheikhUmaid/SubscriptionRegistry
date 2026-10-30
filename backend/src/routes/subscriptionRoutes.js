
import express from "express";

import {
    createSubscription,
    getSubscriptions,
    extendSubscription,
    suspendSubscription,
    deleteSubscription
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/", createSubscription);
router.get("/", getSubscriptions);

router.patch("/:id/extend", extendSubscription);
router.patch("/:id/suspend", suspendSubscription);
router.delete("/:id", deleteSubscription);

export default router;
