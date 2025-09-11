
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface APExam {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  mcqCount: number;
  questionTypes: ('MCQ' | 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ')[];
}

export interface PracticeQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

export interface FreeResponseQuestion {
  type: 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ';
  prompt: string;
  documents?: { source: string; content: string }[];
}
