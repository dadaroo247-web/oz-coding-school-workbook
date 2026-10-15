'use client';

import type { ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';
import Navbar from './Navbar';

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme } = useSettings();

  return (
    <div className="app-shell" data-theme={theme}>
      <Navbar />
      <main id="main-content" className="main">{children}</main>
    </div>
  );
}
