import { create } from 'zustand';

interface AnswerStore {
  questions: string[];
  answers: string[];
  confirmations: (boolean | null)[];
  analyses: (string | null)[];
  isSubmitting: boolean;
  initializeStore: (questions: string[]) => void;
  setAnswer: (index: number, answer: string) => void;
  setCorrectAnswer: (index: number, isCorrect: boolean, analysis: string) => void;
  toggleConfirmation: (index: number) => void;
  setIsSubmitting: (value: boolean) => void;
}

export const useAnswerStore = create<AnswerStore>((set) => ({
  questions: [],
  answers: [],
  confirmations: [],
  analyses: [],
  isSubmitting: false,

  initializeStore: (questions) => set(() => ({
    questions,
    answers: new Array(questions.length).fill(''),
    confirmations: new Array(questions.length).fill(null),
    analyses: new Array(questions.length).fill(null),
  })),

  setAnswer: (index, answer) => set((state) => ({
    answers: Object.assign([], state.answers, { [index]: answer }),
  })),

  setCorrectAnswer: (index, isCorrect, analysis) => set((state) => ({
    confirmations: Object.assign([], state.confirmations, { [index]: isCorrect }),
    analyses: Object.assign([], state.analyses, { [index]: analysis }),
  })),

  toggleConfirmation: (index) => set((state) => ({
    confirmations: Object.assign([], state.confirmations, {
      [index]: !state.confirmations[index],
    }),
  })),

  setIsSubmitting: (value) => set({ isSubmitting: value }),
})); 