const API_URL = `${import.meta.env.VITE_URL}`;
// const API_URL = 'http://localhost:3000/quizzes';

const headers = {
  'Content-Type': 'application/json',
};

export interface Question {
  type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
  questionText: string;
  correctAnswer?: boolean;
  correctText?: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface QuizListItem {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  questions: Question[];
}

export const createQuiz = async (quiz: CreateQuizRequest): Promise<{ id: string; title: string }> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(quiz),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create quiz');
  }

  return response.json();
};

export const getAllQuizzes = async (): Promise<QuizListItem[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quizzes');
  }

  return response.json();
};

export const getQuizById = async (id: string): Promise<Quiz> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quiz');
  }

  return response.json();
};

export const deleteQuiz = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete quiz');
  }
};
