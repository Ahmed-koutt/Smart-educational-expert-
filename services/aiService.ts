
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, Difficulty } from "../types";

// استخدام Gemini 3 Pro - النسخة الأقوى لتحليل المحتوى التعليمي
const MODEL_NAME = "gemini-3-pro-preview";

export const generateQuestions = async (
  content: string,
  type: QuestionType,
  difficulty: Difficulty,
  count: number,
  chapter?: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `أنت الخبير التعليمي المعتمد على تقنية Gemini 3 Pro. 
  المحتوى التعليمي الأساسي: "${content}"
  التركيز حالياً على: "${chapter || 'كامل المحتوى المتاح'}"
  
  المطلوب منك هو:
  1. إنشاء عدد (${count}) أسئلة تعليمية احترافية.
  2. مراعاة مستوى الصعوبة: ${difficulty}.
  3. نوع الأسئلة المطلوبة: ${type === 'mix' ? 'مزيج ذكي من الاختياري والصواب والخطأ' : type === 'mcq' ? 'اختيار من متعدد بأربع خيارات' : 'صواب وخطأ'}.
  
  يجب أن يكون الرد بتنسيق JSON حصراً كـ Array، ويحتوي كل كائن على:
  - id: رقم السؤال
  - type: 'mcq' أو 'tf'
  - text: نص السؤال بلغة عربية سليمة وواضحة
  - options: (فقط للـ mcq) مصفوفة من 4 خيارات منطقية
  - answer: نص الإجابة الصحيحة تماماً كما ورد في الخيارات أو النص`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              type: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING }
            },
            required: ["id", "type", "text", "answer"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return [];
  }
};

export const getChatResponse = async (
  message: string,
  context: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      systemInstruction: `أنت "Gemini الخبير التعليمي الذكي". 
      سياق الدراسة الحالي: ${context}.
      دورك هو مساعدة الطالب في فهم المادة، شرح الأسئلة المنشأة، وتقديم نصائح دراسية.
      تحدث بالعربية الفصحى بأسلوب مشجع واحترافي.`,
    }
  });

  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "أعتذر، واجه Gemini عطلاً تقنياً بسيطاً أثناء معالجة ردك. يرجى المحاولة مرة أخرى.";
  }
};
