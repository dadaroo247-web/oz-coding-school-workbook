'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { toggleTheme, setFilter } from '@/store/todoSlice';
import type { FilterType } from '@/types/todo';

export const useSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, filter } = useSelector((state: RootState) => state.ui);

  const handleToggleTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const handleSetFilter = useCallback((nextFilter: FilterType) => {
    dispatch(setFilter(nextFilter));
  }, [dispatch]);

  return { theme, filter, handleToggleTheme, handleSetFilter };
};
