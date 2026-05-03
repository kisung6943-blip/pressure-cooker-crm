import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: (currentView: string) => React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden font-sans text-[#1d1d1f]">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 md:p-12">
          {children(currentView)}
        </div>
      </main>
    </div>
  );
}
