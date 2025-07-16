import React, { useState } from 'react';

interface CompletionDateModalProps {
  onClose: () => void;
  onConfirm: (date: string) => void;
}

const CompletionDateModal: React.FC<CompletionDateModalProps> = ({ onClose, onConfirm }) => {
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionDate) {
      alert('請選擇一個完成日期。');
      return;
    }
    onConfirm(completionDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900">設定完成日期</h2>
            <p className="text-sm text-slate-500 mt-1">請選擇專案的實際完成日期。</p>
            <div className="mt-4">
              <label htmlFor="completionDate" className="block text-sm font-medium text-slate-700">完成日期</label>
              <input
                type="date"
                id="completionDate"
                value={completionDate}
                onChange={e => setCompletionDate(e.target.value)}
                required
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              確認完成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionDateModal;
