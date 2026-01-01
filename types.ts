
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'tf' | 'mix';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  answer: string;
  userAnswer?: string;
}

export interface AppState {
  settings: {
    difficulty: Difficulty;
    type: QuestionType;
    showAnswers: boolean;
    fileName: string;
    questionCount: number;
    chapterName: string;
  };
  questions: Question[];
  messages: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
