// Local development entry point only. On Vercel, src/app.js is served
// directly as a serverless function and this file never runs.
import dotenv from "dotenv";
import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

// Work around local DNS resolvers that refuse SRV lookups (querySrv ECONNREFUSED)
// for mongodb+srv URIs. Not applied in production.
if (process.env.NODE_ENV !== "production") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Zinth Labs Registry running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();
