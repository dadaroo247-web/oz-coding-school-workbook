'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import TodoList from '@/components/todo/TodoList';

export default function CompletedPage() {
  const { handleSetFilter } = useSettings();

  useEffect(() => {
    handleSetFilter('완료');
  }, [handleSetFilter]);

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">하나씩 쌓아 온 성취</p>
        <h1 className="heading">완료된 할 일</h1>
        <p className="page-description">끝낸 일을 모아 보고, 필요하면 다시 진행할 수 있어요.</p>
      </div>
      <TodoList filter="완료" />
    </>
  );
}
