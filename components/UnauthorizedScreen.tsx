import React from 'react';
import { UserProfile } from '../auth/auth';
import { LogoutIcon } from './icons/LogoutIcon';

interface UnauthorizedScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

const UnauthorizedScreen: React.FC<UnauthorizedScreenProps> = ({ user, onLogout }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
      <div className="w-full max-w-lg mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center border-t-4 border-red-500">
        <h1 className="text-3xl font-bold text-red-700">
          權限不足
        </h1>
        <p className="mt-4 text-md text-slate-600">
          您的帳號 <span className="font-semibold text-slate-800 break-all">{user.email}</span> 未被授權使用本系統。
        </p>
        <p className="mt-2 text-md text-slate-600">
          如果您認為這是一個錯誤，請聯絡系統管理員以請求存取權限。
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <LogoutIcon className="h-5 w-5 mr-2" />
            登出
          </button>
        </div>
      </div>
       <footer className="text-center mt-8 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} 專案管理系統. All rights reserved.</p>
       </footer>
    </div>
  );
};

export default UnauthorizedScreen;
