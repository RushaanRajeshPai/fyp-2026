import mongoose, { Schema } from "mongoose";
import { IShortlistedJob } from "../types";

const shortlistedJobSchema = new Schema<IShortlistedJob>(
    {
        jobTitle: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        companyImage: {
            type: String,
            default: "",
        },
        applicationUrl: {
            type: String,
            default: "",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
    },
    {
        timestamps: true,
    }
);

const ShortlistedJob = mongoose.model<IShortlistedJob>(
    "ShortlistedJob",
    shortlistedJobSchema
);
export default ShortlistedJob;
