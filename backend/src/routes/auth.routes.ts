import { Router } from "express";
import { signup, login, getProfile } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile/:userId", getProfile);

export default router;
