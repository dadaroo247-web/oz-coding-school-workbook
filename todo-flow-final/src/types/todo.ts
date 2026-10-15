import type { Timestamp } from 'firebase/firestore';

// Firestore에 저장할 할 일 항목의 구조
export interface Todo {
  id: string; // Firestore 문서 ID
  text: string; // 할 일 내용
  isDone: boolean; // 완료 여부
  createdAt: Timestamp | null; // Firestore Timestamp
}

// 'all'은 화면에서 '전체'로 표시합니다.
export type FilterType = 'all' | '진행 중' | '완료';

export type ThemeType = 'light' | 'dark';
