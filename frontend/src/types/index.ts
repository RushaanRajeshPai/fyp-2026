export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface ParsedResume {
    skills: string[];
    experience: string[];
    projects: string[];
    summary: string;
}

export interface JobResult {
    jobTitle: string;
    companyName: string;
    companyImage: string;
    applicationUrl: string;
    location?: string;
    datePosted?: string;
}

export interface ShortlistedJob {
    _id: string;
    jobTitle: string;
    companyName: string;
    companyImage?: string;
    applicationUrl?: string;
    userId: string;
    createdAt: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export interface UploadResumeResponse {
    resumeId: string;
    parsedResume: ParsedResume;
    jobs: JobResult[];
}
