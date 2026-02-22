import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFParse } from "pdf-parse";
import { ApiResponse, ATSScoreResponse } from "../types";

export const analyzeATSScore = async (
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
        let pageCount = 1;

        if (mimetype === "application/pdf") {
            try {
                const parser = new PDFParse({ data: fileBuffer });
                const pdfData = await parser.getText();
                pdfText = pdfData.text;
                // Estimate page count from form feeds or text length
                const formFeeds = (pdfText.match(/\f/g) || []).length;
                pageCount = formFeeds > 0 ? formFeeds + 1 : Math.max(1, Math.ceil(pdfText.length / 3000));
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
                message: "Only PDF files are supported for ATS score analysis.",
            } as ApiResponse);
            fs.unlinkSync(filePath);
            return;
        }

        fs.unlinkSync(filePath);

        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.15,
        });

        const promptText = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. You have extensive knowledge of how ATS systems like Lever, Greenhouse, Workday, Taleo, iCIMS, and others parse and score resumes.

Analyze the following resume text thoroughly and provide a comprehensive ATS compatibility score.

Resume Text:
"""
${pdfText}
"""

Estimated Page Count: ${pageCount}

Evaluate the resume on ALL of the following criteria:

**1. Content Sections (30 points)**
- Does the resume have a clear Work Experience section with proper job titles, company names, dates, and bullet-point descriptions?
- Does it have a Projects section with project names, descriptions, technologies used, and links?
- Does it have a Skills section with relevant technical and soft skills, properly categorized?
- Does it have a professional Summary/Objective section at the top?
- Does it have an Education section with degree, institution, dates, and GPA (if applicable)?
- Are there certifications, awards, or publications if relevant?

**2. Grammar & Language (15 points)**
- Are there any grammatical errors, typos, or awkward phrasing?
- Are action verbs used to start bullet points (Developed, Implemented, Led, etc.)?
- Is the language professional and concise?
- Are there any spelling mistakes?

**3. Formatting & Structure (25 points)**
- Are section headers clearly defined and consistent in style?
- Is the font usage consistent throughout?
- Are there uneven paddings or spacing issues detectable from the text structure?
- Are important numbers, metrics, and achievements likely bold or emphasized (e.g., "increased revenue by **40%**")?
- Is the resume well-organized with clear visual hierarchy?
- Are dates aligned consistently?
- Is bullet point formatting consistent?

**4. ATS Optimization (15 points)**
- Does the resume avoid tables, columns, headers/footers, and graphics that ATS cannot parse?
- Are standard section headings used (e.g., "Work Experience" not "Where I've Worked")?
- Is the file format ATS-friendly?
- Are keywords and industry terms present?
- Does it avoid special characters or unusual formatting?

**5. Page Length (5 points)**
- Is the resume ideally 1 page for entry-level/mid-level or 2 pages max for senior roles?
- Is content concise without unnecessary filler?

**6. Links & Contact Info (10 points)**
- Does the resume include project links (GitHub, live demos)?
- Is there a LinkedIn profile link?
- Is there a portfolio/website link?
- Is there proper contact information (email, phone)?
- Is name prominently placed at the top?

Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON must have these exact keys:
{
  "overallScore": <number 0-100>,
  "sectionScores": {
    "contentSections": <number 0-30>,
    "grammarLanguage": <number 0-15>,
    "formattingStructure": <number 0-25>,
    "atsOptimization": <number 0-15>,
    "pageLength": <number 0-5>,
    "linksContactInfo": <number 0-10>
  },
  "doneRight": [
    "Specific thing done well 1",
    "Specific thing done well 2",
    "Specific thing done well 3",
    "Specific thing done well 4",
    "Specific thing done well 5"
  ],
  "improvements": [
    "Specific improvement needed 1 with actionable advice",
    "Specific improvement needed 2 with actionable advice",
    "Specific improvement needed 3 with actionable advice",
    "Specific improvement needed 4 with actionable advice",
    "Specific improvement needed 5 with actionable advice"
  ],
  "summary": "A 2-3 sentence overall assessment of the resume's ATS compatibility",
  "detectedSections": ["List of sections found in the resume"],
  "missingSections": ["List of important sections missing from the resume"],
  "keywordsFound": ["List of relevant keywords/skills detected"],
  "pageCount": ${pageCount}
}

Be strict but fair in your scoring. Most average resumes score between 45-65. Well-optimized resumes score 70-85. Only exceptional resumes score above 85. Provide at least 5 items each for doneRight and improvements.`;

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

        let atsData: ATSScoreResponse;
        try {
            atsData = JSON.parse(cleanedContent) as ATSScoreResponse;
        } catch (parseError) {
            console.error("Failed to parse AI ATS response:", cleanedContent);
            res.status(500).json({
                success: false,
                message: "Failed to generate a properly formatted ATS analysis.",
            } as ApiResponse);
            return;
        }

        res.status(200).json({
            success: true,
            message: "ATS score analysis completed successfully",
            data: atsData,
        } as ApiResponse<ATSScoreResponse>);
    } catch (error) {
        console.error("ATS Score analysis error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while analyzing ATS score",
        } as ApiResponse);
    }
};
