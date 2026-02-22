import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import axios from "axios";
import { PDFParse } from "pdf-parse";
import Resume from "../models/resumes.model";
import User from "../models/users.model";
import ShortlistedJob from "../models/shortlistedJobs.model";
import { ApiResponse, ParsedResume, JobResult } from "../types";

// ─── Parse Resume with OpenAI via LangChain ───
const parseResumeWithAI = async (
    fileBuffer: Buffer,
    mimetype: string
): Promise<ParsedResume> => {
    const model = new ChatOpenAI({
        modelName: "gpt-4o",
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
    });

    const promptText = `You are a resume parser. Analyze this resume document and extract the following information in a structured JSON format. 
          
Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON should have these exact keys:
{
  "skills": ["skill1", "skill2", ...],
  "experience": ["experience description 1", "experience description 2", ...],
  "projects": ["project description 1", "project description 2", ...],
  "summary": "A brief summary/about section of the candidate"
}

If a section is not found, return an empty array for arrays or empty string for summary.
Parse the resume thoroughly and extract ALL relevant information.`;

    let contentPayload: any[] = [];

    if (mimetype === "application/pdf") {
        try {
            const parser = new PDFParse({ data: fileBuffer });
            const pdfData = await parser.getText();
            await parser.destroy();
            contentPayload = [
                {
                    type: "text",
                    text: promptText + "\n\nRESUME TEXT:\n" + pdfData.text,
                },
            ];
        } catch (error) {
            console.error("Failed to extract text from PDF:", error);
            throw new Error("Unable to parse PDF content. Please ensure it is a valid text-based PDF.");
        }
    } else {
        const base64File = fileBuffer.toString("base64");
        contentPayload = [
            {
                type: "text",
                text: promptText,
            },
            {
                type: "image_url",
                image_url: {
                    url: `data:${mimetype};base64,${base64File}`,
                },
            },
        ];
    }

    const response = await model.invoke([
        new HumanMessage({
            content: contentPayload,
        }),
    ]);

    const content =
        typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);

    // Clean any markdown formatting
    const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

    try {
        return JSON.parse(cleanedContent) as ParsedResume;
    } catch {
        console.error("Failed to parse AI response:", cleanedContent);
        return {
            skills: [],
            experience: [],
            projects: [],
            summary: "",
        };
    }
};

// ─── Geocode Location via Nominatim (OpenStreetMap) ───
const geocodeLocation = async (
    location: string
): Promise<{ lat: number; lon: number } | null> => {
    if (!location || !location.trim()) return null;

    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: location,
                    format: "json",
                    limit: 1,
                },
                headers: {
                    "User-Agent": "AscendAI/1.0",
                },
            }
        );

        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon),
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error for:", location, error);
        return null;
    }
};

// Small delay helper to respect Nominatim rate limits (1 req/sec)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Fetch Jobs via RapidAPI (JSearch) ───
const fetchJobsFromAPI = async (
    parsedResume: ParsedResume
): Promise<JobResult[]> => {
    const topSkills = parsedResume.skills.slice(0, 2).join(" ");
    let searchQuery = topSkills;

    // Fallback if no skills are detected
    if (!searchQuery) {
        searchQuery = "software engineer";
    }

    try {
        const response = await axios.get(
            "https://jsearch.p.rapidapi.com/search",
            {
                params: {
                    query: searchQuery,
                    page: "1",
                    num_pages: "1",
                    date_posted: "month",
                },
                headers: {
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
                    "x-rapidapi-host": "jsearch.p.rapidapi.com",
                },
            }
        );

        if (response.data && response.data.data) {
            const jobs: JobResult[] = response.data.data.map(
                (job: {
                    job_title?: string;
                    employer_name?: string;
                    employer_logo?: string;
                    job_apply_link?: string;
                    job_city?: string;
                    job_state?: string;
                    job_country?: string;
                    job_posted_at_datetime_utc?: string;
                    job_latitude?: number;
                    job_longitude?: number;
                }) => ({
                    jobTitle: job.job_title || "Unknown Title",
                    companyName: job.employer_name || "Unknown Company",
                    companyImage:
                        job.employer_logo ||
                        "https://via.placeholder.com/80x80?text=Company",
                    applicationUrl: job.job_apply_link || "#",
                    location: `${job.job_city || ""} ${job.job_state || ""} ${job.job_country || ""}`.trim(),
                    datePosted: job.job_posted_at_datetime_utc || "",
                    latitude: job.job_latitude || undefined,
                    longitude: job.job_longitude || undefined,
                })
            );

            // Deduplicate jobs by jobTitle + companyName
            const seen = new Set<string>();
            const uniqueJobs = jobs.filter((job) => {
                const key = `${job.jobTitle.toLowerCase()}-${job.companyName.toLowerCase()}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Geocode jobs that are missing coordinates
            const geocodeCache: Record<string, { lat: number; lon: number } | null> = {};

            for (const job of uniqueJobs) {
                if (job.latitude && job.longitude) continue;
                if (!job.location) continue;

                // Use cached result if we've already geocoded this location
                if (geocodeCache[job.location] !== undefined) {
                    const cached = geocodeCache[job.location];
                    if (cached) {
                        job.latitude = cached.lat;
                        job.longitude = cached.lon;
                    }
                    continue;
                }

                // Geocode and cache the result
                const coords = await geocodeLocation(job.location);
                geocodeCache[job.location] = coords;
                if (coords) {
                    job.latitude = coords.lat;
                    job.longitude = coords.lon;
                }

                // Respect Nominatim rate limit
                await delay(1000);
            }

            return uniqueJobs;
        }

        return [];
    } catch (error) {
        console.error("Job API error:", error);
        return [];
    }
};

// ─── Upload Resume Controller ───
export const uploadResume = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            } as ApiResponse);
            return;
        }

        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "Resume file is required",
            } as ApiResponse);
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            } as ApiResponse);
            return;
        }

        // Create resume record
        const resume = await Resume.create({
            userId: user._id,
            userEmail: user.email,
        });

        // Update user's resumes array
        user.resumes.push(resume._id);
        await user.save();

        // Parse resume with OpenAI
        const filePath = path.resolve(req.file.path);
        const fileBuffer = fs.readFileSync(filePath);
        const parsedResume = await parseResumeWithAI(fileBuffer, req.file.mimetype);

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        // Fetch jobs based on parsed resume
        const jobs = await fetchJobsFromAPI(parsedResume);

        res.status(200).json({
            success: true,
            message: "Resume parsed and jobs fetched successfully",
            data: {
                resumeId: resume._id,
                parsedResume,
                jobs,
            },
        } as ApiResponse);
    } catch (error) {
        console.error("Upload resume error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while processing resume",
        } as ApiResponse);
    }
};

// ─── Shortlist Job Controller ───
export const shortlistJob = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId, jobTitle, companyName, companyImage, applicationUrl } =
            req.body;

        if (!userId || !jobTitle || !companyName) {
            res.status(400).json({
                success: false,
                message: "User ID, job title, and company name are required",
            } as ApiResponse);
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            } as ApiResponse);
            return;
        }

        // Check if already shortlisted
        const existingJob = await ShortlistedJob.findOne({
            userId,
            jobTitle,
            companyName,
        });

        if (existingJob) {
            res.status(409).json({
                success: false,
                message: "Job already shortlisted",
            } as ApiResponse);
            return;
        }

        const shortlistedJob = await ShortlistedJob.create({
            jobTitle,
            companyName,
            companyImage: companyImage || "",
            applicationUrl: applicationUrl || "",
            userId,
        });

        // Update user's shortlisted jobs array
        user.shortlistedJobs.push(shortlistedJob._id);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Job shortlisted successfully",
            data: shortlistedJob,
        } as ApiResponse);
    } catch (error) {
        console.error("Shortlist job error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as ApiResponse);
    }
};

// ─── Get Shortlisted Jobs ───
export const getShortlistedJobs = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.params;

        const jobs = await ShortlistedJob.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Shortlisted jobs fetched",
            data: jobs,
        } as ApiResponse);
    } catch (error) {
        console.error("Get shortlisted jobs error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as ApiResponse);
    }
};

// ─── Remove Shortlisted Job ───
export const removeShortlistedJob = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { jobId } = req.params;
        const { userId } = req.body;

        const job = await ShortlistedJob.findById(jobId);
        if (!job) {
            res.status(404).json({
                success: false,
                message: "Shortlisted job not found",
            } as ApiResponse);
            return;
        }

        // Remove from user's shortlistedJobs array
        await User.findByIdAndUpdate(userId, {
            $pull: { shortlistedJobs: jobId },
        });

        await ShortlistedJob.findByIdAndDelete(jobId);

        res.status(200).json({
            success: true,
            message: "Job removed from shortlist",
        } as ApiResponse);
    } catch (error) {
        console.error("Remove shortlisted job error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as ApiResponse);
    }
};
