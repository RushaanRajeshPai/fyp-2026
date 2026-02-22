import { Router } from "express";
import multer from "multer";
import path from "path";
import { analyzeATSScore } from "../controllers/atsScore.controller";

const router = Router();

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../../uploads"));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed for ATS score analysis."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

router.post("/analyze", upload.single("resume"), analyzeATSScore);

export default router;
