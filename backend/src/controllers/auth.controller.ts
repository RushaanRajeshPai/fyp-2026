import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/users.model";
import { IUserSignup, IUserLogin, ApiResponse } from "../types";

// ─── Sign Up ───
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password }: IUserSignup = req.body;

        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "All fields are required",
            } as ApiResponse);
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "User with this email already exists",
            } as ApiResponse);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            shortlistedJobs: [],
            resumes: [],
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        } as ApiResponse);
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as ApiResponse);
    }
};

// ─── Login ───
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: IUserLogin = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            } as ApiResponse);
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            } as ApiResponse);
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        } as ApiResponse);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as ApiResponse);
    }
};

// ─── Get User Profile ───
export const getProfile = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password")
            .populate("shortlistedJobs")
            .populate("resumes");

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "User profile fetched",
            data: user,
        } as ApiResponse);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as ApiResponse);
    }
};
