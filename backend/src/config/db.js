import mongoose from "mongoose";

// Cache the connection on the global object so that warm serverless
// invocations (Vercel) reuse it instead of opening a new one per request.
let cached = globalThis.__mongooseCache;

if (!cached) {
    cached = globalThis.__mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        throw new Error("MONGO_URI is missing in environment variables.");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGO_URI, {
                bufferCommands: false,
                serverSelectionTimeoutMS: 8000,
            })
            .then((mongooseInstance) => {
                console.log("MongoDB connected successfully.");
                return mongooseInstance;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset so the next request can retry instead of reusing a rejected promise.
        cached.promise = null;
        cached.conn = null;
        throw error;
    }

    return cached.conn;
}

export default connectDB;
