'use client';

import { useSettings } from '@/hooks/useSettings';
import TodoInput from '@/components/todo/TodoInput';
import TodoList from '@/components/todo/TodoList';

export default function Home() {
  const { filter } = useSettings();

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">오늘의 작은 실천</p>
        <h1 className="heading">
          {filter === 'all'
            ? '전체 할 일'
            : filter === '진행 중'
              ? '진행 중인 할 일'
              : '완료된 할 일'}
        </h1>
        <p className="page-description">해야 할 일을 적고, 하나씩 완료해 보세요.</p>
      </div>
      <TodoInput />
      <TodoList />
    </>
  );
}
