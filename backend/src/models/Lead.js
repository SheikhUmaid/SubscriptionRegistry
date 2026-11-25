import mongoose from "mongoose";

// A demo request submitted from a public landing page (e.g. the TurfOS site).
export const LEAD_STATUSES = ["new", "contacted", "demo-scheduled", "converted", "closed"];
export const PITCH_OPTIONS = ["1", "2", "3", "4-6", "7+"];

const leadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        phone: { type: String, required: true, trim: true, maxlength: 20 },
        business: { type: String, required: true, trim: true, maxlength: 120 },
        city: { type: String, required: true, trim: true, maxlength: 80 },
        pitches: { type: String, required: true, enum: PITCH_OPTIONS },
        message: { type: String, trim: true, maxlength: 1000, default: "" },
        plan: { type: String, trim: true, maxlength: 60, default: "" },

        source: { type: String, trim: true, maxlength: 60, default: "website" },
        page: { type: String, trim: true, maxlength: 500, default: "" },

        status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
        notes: { type: String, trim: true, maxlength: 2000, default: "" },
    },
    { timestamps: true }
);

leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
