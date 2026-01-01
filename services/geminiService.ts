
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, Difficulty } from "../types";

export const generateQuestionsFromText = async (
  content: string,
  type: QuestionType,
  difficulty: Difficulty
): Promise<Question[]> => {
  // Always create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Based on the following content, generate 5 questions.
  Content: "${content}"
  Difficulty: ${difficulty}
  Question Type: ${type === 'mix' ? 'multiple choice and true/false' : type}
  
  Return the output as a JSON array of objects with these properties:
  - type: 'mcq' or 'tf'
  - text: The question text (in Arabic)
  - options: (only for mcq) array of 4 options (in Arabic)
  - answer: The correct answer (in Arabic)
  
  Ensure all Arabic text is correctly encoded and natural.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING }
            },
            required: ["type", "text", "answer"]
          }
        }
      }
    });

    // Access the .text property directly.
    const data = JSON.parse(response.text || "[]");
    return data.map((q: any, index: number) => ({
      ...q,
      id: index + 1
    }));
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
};

export const chatWithBot = async (
  history: { role: 'user' | 'model'; text: string }[],
  message: string,
  context: string
) => {
  // Always create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are an intelligent educational assistant. You help students understand their lessons better. 
      The current context of the student's study is: "${context}".
      Answer in Arabic professionally and helpfully. Keep responses concise but informative.`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
