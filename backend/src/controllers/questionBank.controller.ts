import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFParse } from "pdf-parse";
import { ApiResponse } from "../types";

// ─── Generate Questions (Resume-based) ───
export const generateQuestionsFromResume = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "Resume file is required",
            } as ApiResponse);
            return;
        }

        const filePath = path.resolve(req.file.path);
        const fileBuffer = fs.readFileSync(filePath);
        const mimetype = req.file.mimetype;

        let pdfText = "";
        if (mimetype === "application/pdf") {
            try {
                const parser = new PDFParse({ data: fileBuffer });
                const pdfData = await parser.getText();
                pdfText = pdfData.text;
                await parser.destroy();
            } catch (error) {
                console.error("Failed to extract text from PDF:", error);
                fs.unlinkSync(filePath);
                res.status(400).json({
                    success: false,
                    message: "Unable to parse PDF content. Please ensure it is a valid text-based PDF.",
                } as ApiResponse);
                return;
            }
        } else {
            res.status(400).json({
                success: false,
                message: "Only PDF resumes are supported.",
            } as ApiResponse);
            fs.unlinkSync(filePath);
            return;
        }

        fs.unlinkSync(filePath);

        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.3,
        });

        const promptText = `You are an expert technical interviewer. Analyze the following resume and generate exactly 5 interview questions based on the candidate's skills, projects, and experience.

Resume content:
${pdfText}

The questions should be a mix of:
- Technical questions about their listed skills
- Behavioral questions about their projects and experience
- Problem-solving questions relevant to their domain

Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON should be:
{
  "questions": [
    "Question 1 text",
    "Question 2 text",
    "Question 3 text",
    "Question 4 text",
    "Question 5 text"
  ]
}

Make the questions specific and relevant to the candidate's actual resume content.`;

        const response = await model.invoke([
            new HumanMessage({ content: promptText }),
        ]);

        const content =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        const cleanedContent = content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        let questionsData: { questions: string[] };
        try {
            questionsData = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("Failed to parse AI questions response:", cleanedContent);
            res.status(500).json({
                success: false,
                message: "Failed to generate properly formatted questions.",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Questions generated successfully",
            data: questionsData,
        } as ApiResponse);
    } catch (error) {
        console.error("Generate questions from resume error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while generating questions",
        } as ApiResponse);
    }
};

// ─── Generate Questions (Role-based) ───
export const generateQuestionsFromRole = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { jobRole, experience } = req.body;

        if (!jobRole || !experience) {
            res.status(400).json({
                success: false,
                message: "Job role and experience are required",
            } as ApiResponse);
            return;
        }

        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.3,
        });

        const promptText = `You are an expert technical interviewer. Generate exactly 5 interview questions for a candidate applying for the following role:

Job Role: ${jobRole}
Experience Level: ${experience}

The questions should be appropriate for the experience level and specific to the job role. Include a mix of:
- Technical questions relevant to the role
- Behavioral/situational questions
- Problem-solving questions

For a fresher, focus more on fundamentals and theoretical knowledge.
For 5+ years experience, focus on architecture, design patterns, and leadership scenarios.
For 10+ years experience, focus on system design, strategic thinking, and team management.

Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON should be:
{
  "questions": [
    "Question 1 text",
    "Question 2 text",
    "Question 3 text",
    "Question 4 text",
    "Question 5 text"
  ]
}

Make the questions challenging and specific to the role and experience level.`;

        const response = await model.invoke([
            new HumanMessage({ content: promptText }),
        ]);

        const content =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        const cleanedContent = content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        let questionsData: { questions: string[] };
        try {
            questionsData = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("Failed to parse AI questions response:", cleanedContent);
            res.status(500).json({
                success: false,
                message: "Failed to generate properly formatted questions.",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Questions generated successfully",
            data: questionsData,
        } as ApiResponse);
    } catch (error) {
        console.error("Generate questions from role error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while generating questions",
        } as ApiResponse);
    }
};

// ─── Analyze Response ───
export const analyzeResponse = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { question, response: userResponse } = req.body;

        if (!question || !userResponse) {
            res.status(400).json({
                success: false,
                message: "Question and response are required",
            } as ApiResponse);
            return;
        }

        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.2,
        });

        const promptText = `You are an expert interview coach. Analyze the following interview response and provide detailed feedback.

Question: ${question}

Candidate's Response: ${userResponse}

Evaluate the response on these three metrics (score each from 0 to 10):
1. **Clarity** - How clear and understandable the response is
2. **Structure** - How well-organized and logical the response is
3. **Depth** - How thorough and detailed the response is

Also provide:
- A brief summary of the candidate's response (2-3 sentences)
- An expected/ideal answer that shows how the candidate could improve their response (3-4 sentences)

Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON should be:
{
  "clarity": 7,
  "structure": 6,
  "depth": 8,
  "responseSummary": "Summary of what the candidate said...",
  "expectedAnswer": "An ideal response would include..."
}

Be fair but constructive in your scoring. A score of 5 means average, 7-8 means good, 9-10 means excellent.`;

        const aiResponse = await model.invoke([
            new HumanMessage({ content: promptText }),
        ]);

        const content =
            typeof aiResponse.content === "string"
                ? aiResponse.content
                : JSON.stringify(aiResponse.content);

        const cleanedContent = content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        let analysisData: {
            clarity: number;
            structure: number;
            depth: number;
            responseSummary: string;
            expectedAnswer: string;
        };
        try {
            analysisData = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("Failed to parse AI analysis response:", cleanedContent);
            res.status(500).json({
                success: false,
                message: "Failed to generate properly formatted analysis.",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Response analyzed successfully",
            data: analysisData,
        } as ApiResponse);
    } catch (error) {
        console.error("Analyze response error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while analyzing response",
        } as ApiResponse);
    }
};
