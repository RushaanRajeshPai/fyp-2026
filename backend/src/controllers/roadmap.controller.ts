import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFParse } from "pdf-parse";
import { ApiResponse, RoadmapResponse } from "../types";

export const generateRoadmap = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { timeframe, targetIndustry, additionalGoals } = req.body;

        if (!timeframe || !targetIndustry) {
            res.status(400).json({
                success: false,
                message: "Timeframe and target industry are required",
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
                message: "Only PDF resumes are supported for roadmap generation at this time.",
            } as ApiResponse);
            fs.unlinkSync(filePath);
            return;
        }

        fs.unlinkSync(filePath);

        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.2, // Slightly creative but structured
        });

        const promptText = `You are an expert career counselor and strategist. Analyze this resume along with the user's goals to create a structured, step-by-step career roadmap. 

Resume details:
${pdfText}

User Goals:
- Timeframe: ${timeframe}
- Target Industry: ${targetIndustry}
- Additional Goals & Context: ${additionalGoals || "None provided"}

Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON should have these exact keys:
{
  "currentPosition": "The candidate's current position fetched from the resume's latest experience section",
  "targetPosition": "A summarized sentence of the target industry plus additional goals",
  "strategyOverview": "A 1 paragraph overview of the strategy to reach the target",
  "steps": [
    {
      "title": "Step 1 main action title",
      "subSteps": ["Specific actionable sub-step 1a", "Specific actionable sub-step 1b", "Specific actionable sub-step 1c"]
    },
    {
      "title": "Step 2 main action title",
      "subSteps": ["Specific actionable sub-step 2a", "Specific actionable sub-step 2b", "Specific actionable sub-step 2c"]
    },
    {
      "title": "Step 3 main action title",
      "subSteps": ["Specific actionable sub-step 3a", "Specific actionable sub-step 3b", "Specific actionable sub-step 3c"]
    },
    {
      "title": "Step 4 main action title",
      "subSteps": ["Specific actionable sub-step 4a", "Specific actionable sub-step 4b", "Specific actionable sub-step 4c"]
    },
    {
      "title": "Step 5 main action title",
      "subSteps": ["Specific actionable sub-step 5a", "Specific actionable sub-step 5b", "Specific actionable sub-step 5c"]
    }
  ],
  "skillsToDevelop": ["Skill 1", "Skill 2", "Skill 3"],
  "longTermVision": ["After achieving the target goal, do X to solidify career", "Do Y to expand your domain influence", "Do Z to future-proof your career"]
}

IMPORTANT INSTRUCTIONS:
- Ensure exactly 5 steps are provided with 3-4 specific, actionable sub-steps each.
- Each step title should be a concise action-oriented description.
- Each sub-step should be a concrete, executable action (e.g. "Enroll in AWS Solutions Architect certification course" not just "Learn cloud").
- For longTermVision, provide 3-5 bullet points describing what the candidate should do AFTER they have achieved their target goal within the selected timeframe, to further solidify and advance their career. Focus on career consolidation, thought leadership, mentorship, specialized expertise, and building lasting professional impact.
- Be specific and actionable based on the provided resume and goals.`;

        const response = await model.invoke([
            new HumanMessage({
                content: promptText,
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

        let roadmapData: RoadmapResponse;
        try {
            roadmapData = JSON.parse(cleanedContent) as RoadmapResponse;
        } catch (parseError) {
            console.error("Failed to parse AI roadmap response:", cleanedContent);
            res.status(500).json({
                success: false,
                message: "Failed to generate a properly formatted roadmap.",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Roadmap generated successfully",
            data: roadmapData,
        } as ApiResponse);
    } catch (error) {
        console.error("Generate roadmap error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while generating roadmap",
        } as ApiResponse);
    }
};
