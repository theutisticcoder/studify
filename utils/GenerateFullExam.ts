import { FullExam } from "../types";
import { gemini } from "./geminiClient"; // adjust import to match how you're calling Gemini

export async function generateFullExam(subject: string): Promise<FullExam> {
  const prompt = `
  Generate a full-length AP ${subject} exam. 
  Use College Board exam format with multiple sections. 
  Respond ONLY with valid JSON in this exact shape:

  {
    "examTitle": "AP ${subject} Practice Exam",
    "timeLimitMinutes": 180,
    "sections": [
      {
        "sectionTitle": "Multiple Choice",
        "questions": [
          {
            "id": "q1",
            "questionText": "What is 2 + 2?",
            "options": ["2","3","4","5"],
            "correctOptionIndex": 2,
            "explanation": "2 + 2 = 4"
          }
        ]
      },
      {
        "sectionTitle": "Free Response",
        "questions": [
          {
            "id": "frq1",
            "questionText": "Explain the significance of photosynthesis in ecosystems."
          }
        ]
      }
    ]
  }
  `;

  const response = await gemini.generateContent(prompt);

  try {
    return JSON.parse(response.response.text()) as FullExam;
  } catch (err) {
    console.error("Failed to parse Gemini response", err);
    throw err;
  }
}