import React, { useState, useCallback, FormEvent, useEffect, useMemo, useRef } from 'react';
import { Project, Personnel, Category } from '../types';
import { XIcon } from './icons/XIcon';

interface ProjectFormModalProps {
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'completionDate' | 'status'>) => void;
  projectToEdit: Project | null;
  personnel: Personnel[];
  categories: Category[];
}

// A custom multi-select dropdown component
const PersonnelSelector = ({
  label,
  personnel,
  selectedIds,
  onToggleSelection,
  placeholder,
  isRequired = false
}: {
  label: string;
  personnel: Personnel[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  placeholder: string;
  isRequired?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPersonnel = useMemo(() => {
    if (!searchTerm) return personnel;
    const lowercasedTerm = searchTerm.toLowerCase();
    return personnel.filter(p => p.name.toLowerCase().includes(lowercasedTerm));
  }, [personnel, searchTerm]);
  
  const selectedPersonnel = useMemo(() => {
    return selectedIds
      .map(id => personnel.find(p => p.id === id))
      .filter((p): p is Personnel => !!p);
  }, [selectedIds, personnel]);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700">{label} {isRequired && <span className="text-red-500">*</span>}</label>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full cursor-default rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        >
          <div className="flex flex-wrap items-center gap-2 min-h-[22px]">
            {selectedPersonnel.length > 0 ? (
              selectedPersonnel.map(person => (
                <span
                  key={person.id}
                  className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium px-2 py-1 rounded-full"
                >
                  {person.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dropdown from closing
                      onToggleSelection(person.id);
                    }}
                    className="text-indigo-500 hover:text-indigo-800 focus:outline-none"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.67-2.66a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0l-3.25-3.25a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1 max-h-60 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <div className="p-2">
                <input
                    type="text"
                    placeholder="搜尋人員..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <ul className="overflow-y-auto max-h-40">
              {filteredPersonnel.length > 0 ? filteredPersonnel.map(person => (
                <li
                  key={person.id}
                  onClick={() => onToggleSelection(person.id)}
                  className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-slate-900 hover:bg-indigo-100 flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(person.id)}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3 pointer-events-none"
                  />
                  <span className="block truncate">{person.name}</span>
                </li>
              )) : (
                <li className="relative cursor-default select-none py-2 px-4 text-slate-700">
                  找不到人員
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};


const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ onClose, onSave, projectToEdit, personnel, categories }) => {
  const isEditMode = !!projectToEdit;

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [supervisorIds, setSupervisorIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailDaysBefore, setEmailDaysBefore] = useState(14);
  const [emailReminderTime, setEmailReminderTime] = useState('09:00');
  const [lineEnabled, setLineEnabled] = useState(false);
  const [lineDaysBefore, setLineDaysBefore] = useState(7);
  const [lineReminderTime, setLineReminderTime] = useState('09:00');
  
  useEffect(() => {
    const resetForm = () => {
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDueDate(new Date().toISOString().split('T')[0]);
      setAssigneeIds([]);
      setSupervisorIds([]);
      setNotes('');
      setLocalPath('');
      setEmailEnabled(false);
      setEmailDaysBefore(14);
      setEmailReminderTime('09:00');
      setLineEnabled(false);
      setLineDaysBefore(7);
      setLineReminderTime('09:00');
    };

    if (projectToEdit) {
      setName(projectToEdit.name);
      setCategoryId(projectToEdit.categoryId);
      setDueDate(projectToEdit.dueDate);
      setAssigneeIds(projectToEdit.assigneeIds);
      setSupervisorIds(projectToEdit.supervisorIds);
      setNotes(projectToEdit.notes);
      setLocalPath(projectToEdit.localPath || '');
      setEmailEnabled(projectToEdit.reminders.email.enabled);
      setEmailDaysBefore(projectToEdit.reminders.email.daysBefore || 14);
      setEmailReminderTime(projectToEdit.reminders.email.reminderTime || '09:00');
      setLineEnabled(projectToEdit.reminders.line.enabled);
      setLineDaysBefore(projectToEdit.reminders.line.daysBefore || 7);
      setLineReminderTime(projectToEdit.reminders.line.reminderTime || '09:00');
    } else {
      resetForm();
    }
  }, [projectToEdit, categories]);

  const handleToggleAssignee = (id: number) => {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleSupervisor = (id: number) => {
    setSupervisorIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !dueDate || !categoryId || assigneeIds.length === 0) {
      alert('請填寫所有必填欄位（專案名稱、分類、到期日、辦理人）。');
      return;
    }
    
    const projectData = {
      name,
      categoryId: Number(categoryId),
      dueDate,
      assigneeIds,
      supervisorIds,
      notes,
      localPath,
      reminders: {
        email: {
          enabled: emailEnabled,
          daysBefore: emailEnabled ? Number(emailDaysBefore) : 0,
          reminderTime: emailEnabled ? emailReminderTime : '09:00'
        },
        line: {
          enabled: lineEnabled,
          daysBefore: lineEnabled ? Number(lineDaysBefore) : 0,
          reminderTime: lineEnabled ? lineReminderTime : '09:00'
        }
      }
    };
    
    onSave(projectData);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 flex-grow">
            <h2 className="text-2xl font-bold text-slate-900">{isEditMode ? '編輯專案' : '新增專案'}</h2>
            <p className="text-sm text-slate-500 mt-1">{isEditMode ? '修改下方的欄位來更新專案。' : '填寫下方的欄位來建立新的專案。'}</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">專案名稱 <span className="text-red-500">*</span></label>
                <div className="mt-1">
                   <input
                    type="text" id="name" value={name} onChange={e => setName(e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="例如：第四季行銷活動" required />
                </div>
              </div>

               <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">分類 <span className="text-red-500">*</span></label>
                <select id="category" value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} required
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                   <option value="" disabled>請選擇一個分類...</option>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
               <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">到期日 <span className="text-red-500">*</span></label>
                  <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required 
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              
                <PersonnelSelector
                  label="辦理人"
                  personnel={personnel}
                  selectedIds={assigneeIds}
                  onToggleSelection={handleToggleAssignee}
                  placeholder="請選擇辦理人..."
                  isRequired={true}
                />

                <PersonnelSelector
                  label="主管"
                  personnel={personnel}
                  selectedIds={supervisorIds}
                  onToggleSelection={handleToggleSupervisor}
                  placeholder="請選擇主管..."
                />

              <div>
                <label htmlFor="localPath" className="block text-sm font-medium text-slate-700">本機資料夾路徑</label>
                 <input type="text" id="localPath" value={localPath} onChange={e => setLocalPath(e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="例如: D:\\Projects\\2024\\ProjectName" />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">備註</label>
                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} 
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="列出此專案的相關細節或待辦事項..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">到期提醒</label>
                 <p className="text-xs text-slate-500 mt-1">啟用後，提醒將自動發送給此專案指定的辦理人與主管。</p>
                <div className="mt-2 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <div className="flex items-center">
                        <input id="email-reminder" type="checkbox" checked={emailEnabled} onChange={e => setEmailEnabled(e.target.checked)} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="email-reminder" className="ml-2 block text-sm font-medium text-slate-900">透過 Email 提醒</label>
                    </div>
                     {emailEnabled && (
                        <div className="mt-3 pl-6 grid grid-cols-2 gap-x-4">
                            <div>
                                <label htmlFor="emailDaysBefore" className="text-xs font-medium text-slate-600">提前天數</label>
                                <input type="number" id="emailDaysBefore" value={emailDaysBefore} onChange={e => setEmailDaysBefore(Number(e.target.value))} min="1" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="emailReminderTime" className="text-xs font-medium text-slate-600">提醒時間</label>
                                <input type="time" id="emailReminderTime" value={emailReminderTime} onChange={e => setEmailReminderTime(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <div className="flex items-center">
                        <input id="line-reminder" type="checkbox" checked={lineEnabled} onChange={e => setLineEnabled(e.target.checked)} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="line-reminder" className="ml-2 block text-sm font-medium text-slate-900">透過 LINE 提醒</label>
                    </div>
                    {lineEnabled && (
                         <div className="mt-3 pl-6 grid grid-cols-2 gap-x-4">
                            <div>
                                <label htmlFor="lineDaysBefore" className="text-xs font-medium text-slate-600">提前天數</label>
                                <input type="number" id="lineDaysBefore" value={lineDaysBefore} onChange={e => setLineDaysBefore(Number(e.target.value))} min="1" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="lineReminderTime" className="text-xs font-medium text-slate-600">提醒時間</label>
                                <input type="time" id="lineReminderTime" value={lineReminderTime} onChange={e => setLineReminderTime(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 mt-auto border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {isEditMode ? '儲存變更' : '新增專案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;