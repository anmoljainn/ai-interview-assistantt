import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle', // idle, in-progress, completed
  currentCandidate: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  timeRemaining: 0,
  startTime: null,
  endTime: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateInfo: (state, action) => {
      state.currentCandidate = { ...state.currentCandidate, ...action.payload };
    },
    startInterview: (state, action) => {
      const { candidate, questions } = action.payload;
      const firstQuestion = questions[0];
      let timeRemaining = 0;
      
      if (firstQuestion.difficulty === 'Easy') timeRemaining = 20;
      else if (firstQuestion.difficulty === 'Medium') timeRemaining = 60;
      else if (firstQuestion.difficulty === 'Hard') timeRemaining = 120;
      
      return {
        ...state,
        status: 'in-progress',
        currentCandidate: candidate,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        timeRemaining,
        startTime: new Date().toISOString(),
      };
    },
    submitAnswer: (state, action) => {
      const { answer, evaluation } = action.payload;
      const newAnswers = [...state.answers];
      newAnswers[state.currentQuestionIndex] = {
        text: answer,
        evaluation,
      };
      state.answers = newAnswers;
    },
    nextQuestion: (state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      const nextQuestion = state.questions[nextIndex];
      let nextTimeRemaining = 0;
      
      if (nextQuestion.difficulty === 'Easy') nextTimeRemaining = 20;
      else if (nextQuestion.difficulty === 'Medium') nextTimeRemaining = 60;
      else if (nextQuestion.difficulty === 'Hard') nextTimeRemaining = 120;
      
      state.currentQuestionIndex = nextIndex;
      state.timeRemaining = nextTimeRemaining;
    },
    completeInterview: (state) => {
      const totalScore = state.answers.reduce((sum, answer) => {
        return sum + (answer.evaluation?.score || 0);
      }, 0);
      
      const finalScore = totalScore / state.answers.length;
      
      state.status = 'completed';
      state.endTime = new Date().toISOString();
      state.finalScore = finalScore;
    },
    restoreSession: (state) => {
      state.status = 'in-progress';
    },
    resetInterview: () => initialState,
  },
});

export const {
  setCandidateInfo,
  startInterview,
  submitAnswer,
  nextQuestion,
  completeInterview,
  restoreSession,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;