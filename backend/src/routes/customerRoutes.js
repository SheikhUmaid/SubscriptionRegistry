
import express from "express";
import {
    createCustomer,
    getCustomers,
    deleteCustomer
} from "../controllers/customerController.js";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);
router.delete("/:id", deleteCustomer);

export default router;
