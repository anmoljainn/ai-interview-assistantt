import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
};

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      state.list.push({ ...action.payload, id: Date.now().toString() });
    },
    updateCandidate: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.list.findIndex(candidate => candidate.id === id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...updates };
      }
    },
    deleteCandidate: (state, action) => {
      state.list = state.list.filter(candidate => candidate.id !== action.payload);
    },
    setCandidates: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  deleteCandidate,
  setCandidates,
} = candidateSlice.actions;

export default candidateSlice.reducer;