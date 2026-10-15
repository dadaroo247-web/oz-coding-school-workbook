import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FilterType } from '@/types/todo';
import TodoInput from '@/components/todo/TodoInput';
import TodoList from '@/components/todo/TodoList';

const mocks = vi.hoisted(() => ({
  firebase: {
    db: {} as object | null,
    firebaseConfigurationError: null as string | null,
  },
  state: { ui: { filter: 'all', theme: 'light' } },
  firestore: {
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    serverTimestamp: vi.fn(),
    updateDoc: vi.fn(),
  },
  unsubscribe: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  get db() { return mocks.firebase.db; },
  get firebaseConfigurationError() { return mocks.firebase.firebaseConfigurationError; },
}));
vi.mock('firebase/firestore', async (importOriginal) => ({
  ...await importOriginal<typeof import('firebase/firestore')>(),
  ...mocks.firestore,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: typeof mocks.state) => unknown) => selector(mocks.state),
  useDispatch: () => mocks.dispatch,
}));

const activeTodo = { id: 'active-id', text: '회의 준비', isDone: false, createdAt: null };
const completedTodo = { id: 'done-id', text: '장보기', isDone: true, createdAt: null };

function emitTodos(todos = [activeTodo, completedTodo]) {
  const callback = mocks.firestore.onSnapshot.mock.calls[0]?.[1];
  if (typeof callback !== 'function') throw new Error('Firestore subscription was not started.');
  act(() => callback({
    docs: todos.map(({ id, ...data }) => ({ id, data: () => data })),
  }));
}

function submitInput(value: string) {
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value } });
  const form = input.closest('form');
  if (!form) throw new Error('Todo input must be inside a form.');
  fireEvent.submit(form);
  return { input: input as HTMLInputElement, form };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.firebase.db = {};
  mocks.firebase.firebaseConfigurationError = null;
  mocks.state.ui.filter = 'all';
  mocks.firestore.collection.mockReturnValue('todos-collection');
  mocks.firestore.orderBy.mockReturnValue('newest-first');
  mocks.firestore.query.mockReturnValue('ordered-query');
  mocks.firestore.onSnapshot.mockReturnValue(mocks.unsubscribe);
  mocks.firestore.doc.mockImplementation((_db, collectionName, id) => `${collectionName}/${id}`);
  mocks.firestore.serverTimestamp.mockReturnValue('server-generated-timestamp');
  mocks.firestore.addDoc.mockResolvedValue({ id: 'new-id' });
  mocks.firestore.updateDoc.mockResolvedValue(undefined);
  mocks.firestore.deleteDoc.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe('할 일 추가 (Firestore mock)', () => {
  it('빈 문자열과 공백만 있는 입력은 저장하지 않는다', () => {
    render(<TodoInput />);
    submitInput('   ');
    expect(mocks.firestore.addDoc).not.toHaveBeenCalled();
  });

  it('공백을 제거한 내용과 서버 시간을 저장하고 성공 후 입력을 비운다', async () => {
    render(<TodoInput />);
    const { input } = submitInput('  보고서 작성  ');
    await waitFor(() => expect(input.value).toBe(''));
    expect(mocks.firestore.collection).toHaveBeenCalledWith(mocks.firebase.db, 'todos');
    expect(mocks.firestore.addDoc).toHaveBeenCalledWith('todos-collection', {
      text: '보고서 작성', isDone: false, createdAt: 'server-generated-timestamp',
    });
  });

  it('저장 중 다시 제출해도 중복 문서를 만들지 않는다', async () => {
    let finish: (() => void) | undefined;
    mocks.firestore.addDoc.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    render(<TodoInput />);
    const { form, input } = submitInput('중복 방지 확인');
    fireEvent.submit(form);
    expect(mocks.firestore.addDoc).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    await act(async () => { finish?.(); });
    expect(input.value).toBe('');
  });

  it('쓰기 권한 오류를 알리고 입력 내용을 유지한다', async () => {
    mocks.firestore.addDoc.mockRejectedValue({ code: 'permission-denied' });
    render(<TodoInput />);
    const { input } = submitInput('실패해도 보존할 내용');
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/권한/));
    expect(input.value).toBe('실패해도 보존할 내용');
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false);
  });

  it('Firebase 설정이 없으면 입력과 저장을 비활성화한다', () => {
    mocks.firebase.db = null;
    mocks.firebase.firebaseConfigurationError = 'Firebase 설정이 필요합니다.';
    render(<TodoInput />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    submitInput('저장되지 않아야 함');
    expect(mocks.firestore.addDoc).not.toHaveBeenCalled();
  });
});

describe('실시간 할 일 목록 (Firestore mock)', () => {
  it('첫 스냅샷이 도착하기 전에는 불러오는 상태를 보여 준다', () => {
    render(<TodoList />);
    expect(screen.getByRole('status').textContent).toMatch(/불러오는 중/);
    emitTodos([]);
    expect(screen.queryByText(/불러오는 중/)).toBeNull();
    expect(screen.getByText(/아직 할 일이 없습니다/)).toBeDefined();
  });

  it('서버 생성 시간 내림차순으로 구독하고 스냅샷 변경을 반영하며 구독을 해제한다', () => {
    const { unmount } = render(<TodoList />);
    expect(mocks.firestore.collection).toHaveBeenCalledWith(mocks.firebase.db, 'todos');
    expect(mocks.firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(mocks.firestore.query).toHaveBeenCalledWith('todos-collection', 'newest-first');
    expect(mocks.firestore.onSnapshot.mock.calls[0][0]).toBe('ordered-query');
    emitTodos();
    expect(screen.getByText('회의 준비')).toBeDefined();
    expect(screen.getByText('장보기')).toBeDefined();
    emitTodos([completedTodo]);
    expect(screen.queryByText('회의 준비')).toBeNull();
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['all', true, true],
    ['진행 중', true, false],
    ['완료', false, true],
  ] as const)('Redux 필터 %s를 적용한다', (filter, hasActive, hasCompleted) => {
    mocks.state.ui.filter = filter;
    render(<TodoList />);
    emitTodos();
    expect(screen.queryByText('회의 준비') !== null).toBe(hasActive);
    expect(screen.queryByText('장보기') !== null).toBe(hasCompleted);
  });

  it('완료 페이지의 명시적 필터가 저장된 진행 중 필터보다 우선한다', () => {
    mocks.state.ui.filter = '진행 중';
    render(<TodoList filter={'완료' as FilterType} />);
    emitTodos();
    expect(screen.queryByText('회의 준비')).toBeNull();
    expect(screen.getByText('장보기')).toBeDefined();
  });

  it('진행 중과 완료 항목을 각각 반대 상태로 저장한다', async () => {
    render(<TodoList />);
    emitTodos();
    fireEvent.click(screen.getByRole('button', { name: '회의 준비: 완료로 변경' }));
    await waitFor(() => expect(mocks.firestore.updateDoc).toHaveBeenCalledWith('todos/active-id', { isDone: true }));
    fireEvent.click(screen.getByRole('button', { name: '장보기: 미완료로 변경' }));
    await waitFor(() => expect(mocks.firestore.updateDoc).toHaveBeenCalledWith('todos/done-id', { isDone: false }));
  });

  it('삭제는 지정 문서만 삭제하고 완료 상태를 토글하지 않는다', async () => {
    render(<TodoList />);
    emitTodos();
    fireEvent.click(screen.getByRole('button', { name: /회의 준비.*삭제|삭제.*회의 준비/ }));
    await waitFor(() => expect(mocks.firestore.deleteDoc).toHaveBeenCalledWith('todos/active-id'));
    expect(mocks.firestore.updateDoc).not.toHaveBeenCalled();
  });

  it('변경 요청이 끝날 때까지 같은 할 일의 토글과 삭제를 막는다', async () => {
    let finish: (() => void) | undefined;
    mocks.firestore.updateDoc.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    render(<TodoList />);
    emitTodos();
    const toggle = screen.getByRole('button', { name: '회의 준비: 완료로 변경' }) as HTMLButtonElement;
    const remove = screen.getByRole('button', { name: '회의 준비 삭제' }) as HTMLButtonElement;
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    fireEvent.click(remove);
    expect(toggle.disabled).toBe(true);
    expect(remove.disabled).toBe(true);
    expect(mocks.firestore.updateDoc).toHaveBeenCalledTimes(1);
    expect(mocks.firestore.deleteDoc).not.toHaveBeenCalled();
    await act(async () => { finish?.(); });
    expect(toggle.disabled).toBe(false);
    expect(remove.disabled).toBe(false);
  });

  it.each([
    ['updateDoc', '회의 준비: 완료로 변경'],
    ['deleteDoc', '회의 준비 삭제'],
  ] as const)('%s 권한 오류를 알리고 다시 시도할 수 있게 한다', async (method, accessibleName) => {
    mocks.firestore[method].mockRejectedValue({ code: 'permission-denied' });
    render(<TodoList />);
    emitTodos();
    const button = screen.getByRole('button', { name: accessibleName }) as HTMLButtonElement;
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/권한/));
    expect(screen.getByText('회의 준비')).toBeDefined();
    expect(button.disabled).toBe(false);
  });

  it('구독 권한 오류를 사용자에게 표시한다', () => {
    render(<TodoList />);
    const errorCallback = mocks.firestore.onSnapshot.mock.calls[0]?.[2];
    if (typeof errorCallback !== 'function') throw new Error('Missing Firestore error handler.');
    act(() => errorCallback({ code: 'permission-denied' }));
    expect(screen.getByRole('alert').textContent).toMatch(/권한/);
  });

  it('Firebase 설정이 없으면 Firestore를 구독하지 않는다', () => {
    mocks.firebase.db = null;
    mocks.firebase.firebaseConfigurationError = 'Firebase 설정이 필요합니다.';
    render(<TodoList />);
    expect(mocks.firestore.onSnapshot).not.toHaveBeenCalled();
    expect(screen.getByText(/Firebase 설정/)).toBeDefined();
  });
});
