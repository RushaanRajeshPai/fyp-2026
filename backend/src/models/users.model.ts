import mongoose, { Schema } from "mongoose";
import { IUser } from "../types";

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        shortlistedJobs: [
            {
                type: Schema.Types.ObjectId,
                ref: "ShortlistedJob",
            },
        ],
        resumes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Resume",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
