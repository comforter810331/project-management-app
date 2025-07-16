import React, { useState } from 'react';

interface InitialSetupScreenProps {
  onSetupComplete: () => void;
}

const InitialSetupScreen: React.FC<InitialSetupScreenProps> = ({ onSetupComplete }) => {
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!clientId.trim().endsWith('.apps.googleusercontent.com')) {
      setError('請輸入一個有效的 Google 用戶端 ID。它通常以 .apps.googleusercontent.com 結尾。');
      return;
    }
    setError('');
    localStorage.setItem('google_client_id', clientId.trim());
    onSetupComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-lg mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          系統初次設定
        </h1>
        <p className="mt-3 text-md text-slate-500">
          歡迎使用專案管理系統。作為第一位使用者，請貼上您的 Google Cloud 用戶端 ID 以啟用登入功能。
        </p>
        <div className="mt-8">
          <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 text-left mb-1">
            Google 用戶端 ID
          </label>
          <input
            id="clientId"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="XXXXXX-xxxxxxxx.apps.googleusercontent.com"
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}
          <p className="mt-2 text-xs text-slate-500 text-left">
            您可以在 Google Cloud Console 的「憑證」頁面找到您的用戶端 ID。
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            儲存並繼續
          </button>
        </div>
      </div>
      <footer className="text-center mt-8 text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} 專案管理系統. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InitialSetupScreen;
