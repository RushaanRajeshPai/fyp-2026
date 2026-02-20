import { Router } from "express";
import multer from "multer";
import path from "path";
import {
    uploadResume,
    shortlistJob,
    getShortlistedJobs,
    removeShortlistedJob,
} from "../controllers/job.controller";

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
        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and image files are allowed"));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

router.post("/uploadresume", upload.single("resume"), uploadResume);
router.post("/shortlist", shortlistJob);
router.get("/shortlisted/:userId", getShortlistedJobs);
router.delete("/shortlisted/:jobId", removeShortlistedJob);

export default router;
