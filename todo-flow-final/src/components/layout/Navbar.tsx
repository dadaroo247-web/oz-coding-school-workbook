'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import type { FilterType } from '@/types/todo';

const FILTERS: FilterType[] = ['all', '진행 중', '완료'];

export default function Navbar() {
  const { theme, filter, handleToggleTheme, handleSetFilter } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const isCompletedPage = pathname === '/completed';
  const activeFilter = isCompletedPage ? '완료' : filter;

  function selectFilter(nextFilter: FilterType) {
    handleSetFilter(nextFilter);
    if (isCompletedPage && nextFilter !== '완료') {
      router.push('/');
    }
  }

  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">본문으로 건너뛰기</a>
      <nav className="navbar" aria-label="주 메뉴">
        <Link href="/" className="brand" onClick={() => handleSetFilter('all')}>
          <span className="brand-icon" aria-hidden="true">✓</span>
          TodoFlow
        </Link>

        <div className="filter-group" role="group" aria-label="할 일 필터">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className="filter-button"
              aria-pressed={activeFilter === value}
              onClick={() => selectFilter(value)}
            >
              {value === 'all' ? '전체' : value}
            </button>
          ))}
        </div>

        <div className="nav-links">
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => handleSetFilter('all')}>목록</Link>
          <Link href="/completed" aria-current={isCompletedPage ? 'page' : undefined} onClick={() => handleSetFilter('완료')}>완료</Link>
          <button
            type="button"
            className="theme-button"
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            onClick={handleToggleTheme}
          >
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
