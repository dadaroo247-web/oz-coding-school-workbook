'use client';

import { useRef, useState, type FormEvent } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFirestoreErrorMessage } from '@/lib/firestoreError';

export default function TodoInput() {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!db || !trimmedText || submitting.current) return;

    submitting.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'todos'), {
        text: trimmedText,
        isDone: false,
        createdAt: serverTimestamp(),
      });
      // 서버 저장에 성공한 뒤에만 입력을 비웁니다.
      setText('');
    } catch (error) {
      setError(getFirestoreErrorMessage(error, '할 일을 추가하지 못했습니다. 다시 시도하세요.'));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-label="새 할 일 추가">
      <form onSubmit={handleSubmit} className="todo-form" aria-busy={isSubmitting}>
        <label className="sr-only" htmlFor="new-todo">할 일 내용</label>
        <input
          id="new-todo"
          className="todo-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일을 입력하세요"
          autoComplete="off"
          maxLength={500}
          disabled={!db || isSubmitting}
        />
        <button
          className="primary-button"
          type="submit"
          disabled={!db || !text.trim() || isSubmitting}
        >
          {isSubmitting ? '저장 중…' : '추가'}
        </button>
      </form>
      {error && <p className="error-message" role="alert">{error}</p>}
    </section>
  );
}
