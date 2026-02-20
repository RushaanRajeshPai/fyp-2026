import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

// Connect to MongoDB and start server
const startServer = async (): Promise<void> => {
    try {
        const mongoUri =
            process.env.MONGODB_URI || "mongodb://localhost:27017/jobfinder";
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

startServer();
