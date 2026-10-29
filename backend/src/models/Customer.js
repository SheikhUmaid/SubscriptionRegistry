
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        customerCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            immutable: true,
        },

        businessName: {
            type: String,
            required: true,
            trim: true,
        },

        contactName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        accountStatus: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
