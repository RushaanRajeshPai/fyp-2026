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
    roadmapId?: string;
    roadmapData?: RoadmapResponse;
}

export interface RoadmapResponse {
    currentPosition: string;
    targetPosition: string;
    strategyOverview: string;
    steps: string[];
    skillsToDevelop: string[];
    longTermVision: string;
}

// ─── Question Bank Types ───
export interface QuestionsResponse {
    questions: string[];
}

export interface AnalysisResponse {
    clarity: number;
    structure: number;
    depth: number;
    responseSummary: string;
    expectedAnswer: string;
}
