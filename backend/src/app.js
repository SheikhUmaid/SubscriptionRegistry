
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";


// Routes
import customerRoutes from "./routes/customerRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import renewalRoutes from "./routes/renewalRoutes.js";
import registryRoutes from "./routes/registryRoutes.js";

// Middleware
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Zinth Labs Registry is running."
    });
});

// API routes
app.use("/api/customers", customerRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/renewals", renewalRoutes);
app.use("/api/registry", registryRoutes);

app.use("/api/auth", authRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Global error handler
app.use(errorMiddleware);

export default app;
