import { create } from 'zustand';

interface AnswerStore {
  answers: string[];
  correctAnswers: (boolean | null)[];
  confirmations: (boolean | null)[];
  isSubmitting: boolean;
  questions: string[];
  setAnswer: (index: number, answer: string) => void;
  setCorrectAnswer: (index: number, isCorrect: boolean) => void;
  setConfirmation: (index: number, isConfirmed: boolean) => void;
  toggleConfirmation: (index: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  initializeStore: (questions: string[]) => void;
  resetStore: () => void;
}

export const useAnswerStore = create<AnswerStore>((set) => ({
  answers: [],
  correctAnswers: [],
  confirmations: [],
  isSubmitting: false,
  questions: [],

  setAnswer: (index, answer) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[index] = answer;
      const newCorrectAnswers = [...state.correctAnswers];
      newCorrectAnswers[index] = null;
      const newConfirmations = [...state.confirmations];
      newConfirmations[index] = null;
      return { 
        answers: newAnswers, 
        correctAnswers: newCorrectAnswers,
        confirmations: newConfirmations
      };
    }),

  setCorrectAnswer: (index, isCorrect) =>
    set((state) => {
      const newCorrectAnswers = [...state.correctAnswers];
      newCorrectAnswers[index] = isCorrect;
      const newConfirmations = [...state.confirmations];
      newConfirmations[index] = isCorrect;
      return { 
        correctAnswers: newCorrectAnswers,
        confirmations: newConfirmations
      };
    }),

  setConfirmation: (index, isConfirmed) =>
    set((state) => {
      const newConfirmations = [...state.confirmations];
      newConfirmations[index] = isConfirmed;
      return { confirmations: newConfirmations };
    }),

  toggleConfirmation: (index) =>
    set((state) => {
      if (state.confirmations[index] === null) return state;
      const newConfirmations = [...state.confirmations];
      newConfirmations[index] = !newConfirmations[index];
      return { confirmations: newConfirmations };
    }),

  setIsSubmitting: (isSubmitting) =>
    set({ isSubmitting }),

  initializeStore: (questions) =>
    set({
      questions,
      answers: new Array(questions.length).fill(''),
      correctAnswers: new Array(questions.length).fill(null),
      confirmations: new Array(questions.length).fill(null),
      isSubmitting: false,
    }),

  resetStore: () =>
    set({
      answers: [],
      correctAnswers: [],
      confirmations: [],
      isSubmitting: false,
      questions: [],
    }),
})); 