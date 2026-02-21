import { Router } from "express";
import multer from "multer";
import path from "path";
import {
    generateQuestionsFromResume,
    generateQuestionsFromRole,
    analyzeResponse,
} from "../controllers/questionBank.controller";

const router = Router();

// Multer config for resume uploads
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
            cb(new Error("Only PDF files are allowed."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

// Resume-based question generation (with file upload)
router.post("/generate-from-resume", upload.single("resume"), generateQuestionsFromResume);

// Role-based question generation (JSON body)
router.post("/generate-from-role", generateQuestionsFromRole);

// Analyze user response
router.post("/analyze", analyzeResponse);

export default router;
