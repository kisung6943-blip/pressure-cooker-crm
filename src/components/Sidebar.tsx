import React from 'react';
import { LayoutDashboard, Users, KanbanSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'clients', label: '고객 관리', icon: Users },
    { id: 'board', label: 'AS 현황판', icon: KanbanSquare },
  ];

  return (
    <aside className="w-64 bg-[#f5f5f7] border-r border-gray-200/50 flex flex-col h-full pt-6">
      <div className="px-8 mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
          AS Manager
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                'w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-white text-[#0071e3] shadow-sm'
                  : 'text-gray-500 hover:bg-gray-200/50 hover:text-[#1d1d1f]'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-[#0071e3]' : 'text-gray-400'
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 rounded-xl hover:bg-gray-200/50 cursor-pointer transition-colors">
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          설정
        </div>
      </div>
    </aside>
  );
}
