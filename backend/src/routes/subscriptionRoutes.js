
import express from "express";

import {
    createSubscription,
    getSubscriptions,
    extendSubscription,
    changeSubscriptionPlan,
    getPlans,
    suspendSubscription,
    deleteSubscription
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/plans", getPlans);

router.post("/", createSubscription);
router.get("/", getSubscriptions);

router.patch("/:id/extend", extendSubscription);
router.patch("/:id/plan", changeSubscriptionPlan);
router.patch("/:id/suspend", suspendSubscription);
router.delete("/:id", deleteSubscription);

export default router;
