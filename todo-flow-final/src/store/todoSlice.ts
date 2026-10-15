import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FilterType, ThemeType } from '@/types/todo';

interface UIState {
  theme: ThemeType;
  filter: FilterType;
}

const initialState: UIState = {
  theme: 'light',
  filter: 'all',
};

export const todoSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload;
    },
  },
});

export const { toggleTheme, setFilter } = todoSlice.actions;
export default todoSlice.reducer;
