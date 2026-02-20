import mongoose, { Schema } from "mongoose";
import { IResume } from "../types";

const resumeSchema = new Schema<IResume>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        userEmail: {
            type: String,
            required: [true, "User email is required"],
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
);

const Resume = mongoose.model<IResume>("Resume", resumeSchema);
export default Resume;
