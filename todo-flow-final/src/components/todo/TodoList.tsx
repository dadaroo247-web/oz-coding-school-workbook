'use client';

import { useEffect, useRef, useState } from 'react';
import {
  collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db, firebaseConfigurationError } from '@/lib/firebase';
import { getFirestoreErrorMessage } from '@/lib/firestoreError';
import { useSettings } from '@/hooks/useSettings';
import type { FilterType, Todo } from '@/types/todo';

export default function TodoList({ filter: fixedFilter }: { filter?: FilterType }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(db));
  const [readError, setReadError] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const pending = useRef(new Set<string>());
  const { filter } = useSettings();
  const effectiveFilter = fixedFilter ?? filter;

  useEffect(() => {
    if (!db) return;

    const todosQuery = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(todosQuery, (snapshot) => {
      const nextTodos: Todo[] = [];
      snapshot.docs.forEach((document) => {
        // serverTimestamp의 서버 응답 전에는 로컬 추정 시간을 사용합니다.
        const data = document.data({ serverTimestamps: 'estimate' });
        if (typeof data.text !== 'string' || typeof data.isDone !== 'boolean') return;
        nextTodos.push({
          id: document.id,
          text: data.text,
          isDone: data.isDone,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
        });
      });
      setTodos(nextTodos);
      setReadError(null);
      setIsLoading(false);
    }, (error) => {
      setReadError(getFirestoreErrorMessage(error, '목록을 불러오지 못했습니다. Firebase 설정을 확인한 뒤 새로고침하세요.'));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const mutateTodo = async (todo: Todo, action: 'toggle' | 'delete') => {
    if (!db || pending.current.has(todo.id)) return;
    pending.current.add(todo.id);
    setPendingIds([...pending.current]);
    setWriteError(null);

    try {
      const todoRef = doc(db, 'todos', todo.id);
      if (action === 'delete') {
        await deleteDoc(todoRef);
      } else {
        await updateDoc(todoRef, { isDone: !todo.isDone });
      }
    } catch (error) {
      setWriteError(getFirestoreErrorMessage(error, action === 'delete'
        ? '할 일을 삭제하지 못했습니다. 다시 시도하세요.'
        : '완료 상태를 변경하지 못했습니다. 다시 시도하세요.'));
    } finally {
      pending.current.delete(todo.id);
      setPendingIds([...pending.current]);
    }
  };

  const filtered = todos.filter((todo) => {
    if (effectiveFilter === '진행 중') return !todo.isDone;
    if (effectiveFilter === '완료') return todo.isDone;
    return true;
  });

  if (!db) {
    return (
      <aside className="setup-notice" role="status">
        <strong>Firebase 연결을 준비해 주세요</strong>
        <p>{firebaseConfigurationError}</p>
        <p>연결 전에도 필터와 다크·라이트 테마를 확인할 수 있습니다.</p>
      </aside>
    );
  }

  if (isLoading) return <p className="status-message" role="status">할 일을 불러오는 중…</p>;

  return (
    <section aria-label="할 일 목록">
      {readError && <p className="error-message" role="alert">{readError}</p>}
      {writeError && <p className="error-message" role="alert">{writeError}</p>}
      <p className="list-summary" aria-live="polite">{filtered.length}개의 할 일</p>
      <ul className="todo-list">
        {filtered.map((todo) => {
          const isPending = pendingIds.includes(todo.id);
          return (
            <li key={todo.id} className={`todo-item${todo.isDone ? ' is-done' : ''}`} aria-busy={isPending}>
              <button
                className="todo-toggle"
                type="button"
                aria-pressed={todo.isDone}
                aria-label={`${todo.text}: ${todo.isDone ? '미완료로' : '완료로'} 변경`}
                disabled={isPending || Boolean(readError)}
                onClick={() => void mutateTodo(todo, 'toggle')}
              >
                <span aria-hidden="true">{todo.isDone ? '☑' : '☐'}</span>
                <span className="todo-text">{todo.text}</span>
              </button>
              <button
                className="todo-delete"
                type="button"
                aria-label={`${todo.text} 삭제`}
                disabled={isPending || Boolean(readError)}
                onClick={() => void mutateTodo(todo, 'delete')}
              >
                삭제
              </button>
            </li>
          );
        })}
      </ul>
      {!readError && filtered.length === 0 && (
        <p className="status-message" role="status">
          {effectiveFilter === '완료' ? '완료된 할 일이 없습니다.'
            : effectiveFilter === '진행 중' ? '진행 중인 할 일이 없습니다.'
              : '아직 할 일이 없습니다. 첫 번째 할 일을 추가해 보세요.'}
        </p>
      )}
    </section>
  );
}
