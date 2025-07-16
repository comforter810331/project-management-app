import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { CogIcon } from './icons/CogIcon';
import { UserProfile } from '../auth/auth';
import { LogoutIcon } from './icons/LogoutIcon';
import { BellIcon } from './icons/BellIcon';


interface HeaderProps {
  onAddProject: () => void;
  onOpenSettings: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenReminders: () => void;
  reminderCount: number;
}

const Header: React.FC<HeaderProps> = ({ onAddProject, onOpenSettings, user, onLogout, onOpenReminders, reminderCount }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-2xl font-bold text-slate-900">
            專案管理系統
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
                 <div className="flex items-center space-x-3">
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="h-9 w-9 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-medium text-slate-700 hidden md:block">歡迎, {user.name}</span>
                 </div>
            )}

            <button
                onClick={onOpenReminders}
                type="button"
                className="relative inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-slate-600 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label={`今日提醒 (${reminderCount})`}
              >
                <BellIcon className="h-5 w-5" />
                {reminderCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{reminderCount}</span>
                    </span>
                )}
            </button>


            {user?.role === 'admin' && (
              <button
                onClick={onOpenSettings}
                type="button"
                className="p-2 border border-transparent rounded-full shadow-sm text-slate-600 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors hidden sm:inline-flex"
                aria-label="打開設定"
              >
                <CogIcon className="h-5 w-5" />
              </button>
            )}
            {(user?.role === 'admin' || user?.role === 'editor') && (
              <button
                onClick={onAddProject}
                type="button"
                className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                <span className="hidden sm:inline">新增專案</span>
              </button>
            )}
             <button
              onClick={onLogout}
              type="button"
              className="p-2 border border-transparent rounded-full shadow-sm text-slate-600 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              aria-label="登出"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
