import { Document, Types } from "mongoose";

// ─── User Types ───
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    shortlistedJobs: Types.ObjectId[];
    resumes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserSignup {
    name: string;
    email: string;
    password: string;
}

export interface IUserLogin {
    email: string;
    password: string;
}

// ─── Resume Types ───
export interface IResume extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    userEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Shortlisted Job Types ───
export interface IShortlistedJob extends Document {
    _id: Types.ObjectId;
    jobTitle: string;
    companyName: string;
    companyImage?: string;
    applicationUrl?: string;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Parsed Resume Types ───
export interface ParsedResume {
    skills: string[];
    experience: string[];
    projects: string[];
    summary: string;
}

// ─── Job Search Result Types ───
export interface JobResult {
    jobTitle: string;
    companyName: string;
    companyImage: string;
    applicationUrl: string;
    location?: string;
    datePosted?: string;
}

// ─── API Response Types ───
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}
