import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeWrapper from '@/components/layout/ThemeWrapper';
import uiReducer, { setFilter, toggleTheme } from '@/store/todoSlice';

const navigation = vi.hoisted(() => ({ pathname: '/', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));

beforeEach(() => {
  navigation.pathname = '/';
  navigation.push.mockReset();
  localStorage.clear();
});

afterEach(cleanup);

function renderSettings() {
  const store = configureStore({ reducer: { ui: uiReducer } });
  const rendered = render(
    <Provider store={store}>
      <ThemeWrapper><p>할 일 화면</p></ThemeWrapper>
    </Provider>,
  );
  return { store, ...rendered };
}

describe('Redux 설정과 useSettings 연결', () => {
  it('기본 라이트 테마에서 Navbar 토글로 전체 화면 테마를 전환한다', () => {
    const { store, container } = renderSettings();
    expect(store.getState().ui).toEqual({ theme: 'light', filter: 'all' });
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    expect(store.getState().ui.theme).toBe('dark');
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: '라이트 모드로 전환' }));
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe('light');
  });

  it('필터 버튼이 Redux 상태와 선택 표시를 함께 변경한다', () => {
    const { store } = renderSettings();
    fireEvent.click(screen.getByRole('button', { name: '진행 중' }));
    expect(store.getState().ui.filter).toBe('진행 중');
    expect(screen.getByRole('button', { name: '진행 중' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '전체' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(store.getState().ui.filter).toBe('완료');
  });

  it('완료 페이지에서 진행 중 필터를 누르면 목록으로 이동한다', () => {
    navigation.pathname = '/completed';
    const { store } = renderSettings();
    expect(screen.getByRole('button', { name: '완료' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: '진행 중' }));
    expect(store.getState().ui.filter).toBe('진행 중');
    expect(navigation.push).toHaveBeenCalledWith('/');
  });

  it('실제 store가 테마와 필터를 저장하고 새 store에서 복원한다', async () => {
    vi.resetModules();
    const first = await import('@/store');
    await waitFor(() => expect(first.persistor.getState().bootstrapped).toBe(true));
    first.store.dispatch(toggleTheme());
    first.store.dispatch(setFilter('진행 중'));
    await first.persistor.flush();
    first.persistor.pause();

    const persisted = JSON.parse(localStorage.getItem('persist:root') ?? '{}');
    expect(JSON.parse(persisted.ui)).toEqual({ theme: 'dark', filter: '진행 중' });

    vi.resetModules();
    const reloaded = await import('@/store');
    await waitFor(() => expect(reloaded.persistor.getState().bootstrapped).toBe(true));
    expect(reloaded.store.getState().ui).toEqual({ theme: 'dark', filter: '진행 중' });
    reloaded.persistor.pause();
  });
});
