
import { GoogleGenAI, Type } from "@google/genai";
import { PracticeQuestion, FreeResponseQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getTutorResponseStream = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are IntelliGrade, an expert AI tutor. Your goal is to help students learn any subject by providing clear, concise, and encouraging explanations. When a student asks a question, break down complex topics into simple, understandable parts. Use analogies and real-world examples. If a student is struggling, offer encouragement and guide them towards the answer without giving it away directly. Be patient, positive, and supportive. Your responses should be formatted with markdown for readability.',
      },
      history: history,
    });
    
    const responseStream = await chat.sendMessageStream({ message: newMessage });
    return responseStream;

  } catch (error) {
    console.error("Error getting tutor response:", error);
    throw new Error("Failed to get response from AI tutor.");
  }
};

export const generatePracticeExam = async (examTitle: string): Promise<PracticeQuestion[]> => {
  try {
    const prompt = `Generate a 15-question multiple-choice practice exam for the subject "${examTitle}". This should be a representative sample of questions from the full curriculum, in the style of the official College Board AP exams. For each question, provide:
1. "question": The question text.
2. "options": An array of four distinct string options.
3. "correctAnswerIndex": The 0-based index of the correct answer in the "options" array.
4. "explanation": A detailed explanation for why the correct answer is right and why the other options are incorrect.
Return the result as a single JSON array of objects, with no surrounding text or markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const examData = JSON.parse(jsonString);
    
    if (!Array.isArray(examData) || examData.length === 0) {
      throw new Error("AI returned empty or invalid exam data.");
    }

    return examData as PracticeQuestion[];

  } catch (error) {
    console.error(`Error generating practice exam for ${examTitle}:`, error);
    throw new Error("Failed to generate practice exam. The AI may be busy, please try again.");
  }
};

export const generateFreeResponseQuestion = async (examTitle: string, questionType: 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ'): Promise<FreeResponseQuestion> => {
    let prompt = '';
    let responseSchema: any = {
        type: Type.OBJECT,
        properties: {
            prompt: { type: Type.STRING, description: `The main prompt for the ${questionType}.` }
        },
        required: ['prompt']
    };

    switch(questionType) {
        case 'DBQ':
            prompt = `Generate a Document-Based Question (DBQ) for AP ${examTitle}, in the style of the official College Board exam. Provide a compelling historical prompt and 5-7 relevant primary or secondary source documents. Each document must include a source.`;
            responseSchema.properties.documents = {
                type: Type.ARRAY,
                description: "An array of 5-7 historical documents.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        source: { type: Type.STRING, description: "The source of the document." },
                        content: { type: Type.STRING, description: "The text content of the document." }
                    },
                    required: ['source', 'content']
                }
            };
            responseSchema.required.push('documents');
            break;
        case 'SAQ':
            prompt = `Generate a Short Answer Question (SAQ) for AP ${examTitle}, in the style of the official College Board exam. It should have parts (a), (b), and (c).`;
            break;
        case 'LEQ':
            prompt = `Generate a Long Essay Question (LEQ) for AP ${examTitle}, in the style of the official College Board exam. Provide a choice of two or three prompts if appropriate for the subject.`;
            break;
        case 'FRQ':
            prompt = `Generate a Free-Response Question (FRQ) for AP ${examTitle}, in the style of the official College Board exam. The question should be multi-part if typical for the subject.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonString = response.text.trim();
        const questionData = JSON.parse(jsonString);
        
        return { type: questionType, ...questionData } as FreeResponseQuestion;

    } catch (error) {
        console.error(`Error generating ${questionType} for ${examTitle}:`, error);
        throw new Error(`Failed to generate ${questionType}. The AI may be busy, please try again.`);
    }
};

export const gradeFreeResponseAnswer = async (
    examTitle: string,
    questionPrompt: string,
    userAnswer: string,
    questionType: 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ'
): Promise<string> => {
    try {
        const prompt = `You are an expert AP exam grader for ${examTitle}. A student has answered the following ${questionType} prompt:
---
PROMPT: "${questionPrompt}"
---
STUDENT'S ANSWER: "${userAnswer}"
---
Please provide constructive, detailed feedback on the student's answer. Analyze it based on the official AP rubric for this question type. Address the following in your feedback:
1.  **Strengths**: What did the student do well? (e.g., thesis statement, use of evidence, analysis).
2.  **Areas for Improvement**: Where could the student improve? Be specific.
3.  **Suggested Score**: Provide a plausible score (e.g., for a DBQ, a score out of 7 points) and briefly justify why you are suggesting that score by referencing the rubric points they earned.
Format your entire response using markdown for clear readability.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text;

    } catch (error) {
        console.error(`Error grading response for ${examTitle}:`, error);
        throw new Error("Failed to grade the response. The AI may be busy, please try again.");
    }
};
