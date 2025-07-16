import React, { useState, FormEvent } from 'react';
import { Personnel, Category, Role, Project } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { TagIcon } from './icons/TagIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { RestoreIcon } from './icons/RestoreIcon';

interface SettingsModalProps {
  onClose: () => void;
  personnel: Personnel[];
  categories: Category[];
  projects: Project[];
  onSavePersonnel: (person: Omit<Personnel, 'id'> | Personnel) => void;
  onDeletePersonnel: (id: number) => void;
  onSaveCategory: (category: Omit<Category, 'id'> | Category) => void;
  onDeleteCategory: (id: number) => void;
  onRestoreProject: (id: number) => void;
  onPermanentlyDeleteProject: (id: number) => void;
}

const roleMap: Record<Role, string> = {
    admin: '一級權限',
    editor: '二級權限',
    viewer: '三級權限',
};

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, personnel, categories, projects, onSavePersonnel, onDeletePersonnel, onSaveCategory, onDeleteCategory, onRestoreProject, onPermanentlyDeleteProject
}) => {
  const [activeTab, setActiveTab] = useState<'personnel' | 'categories' | 'trash'>('personnel');
  
  // State for Personnel Form
  const [personnelToEdit, setPersonnelToEdit] = useState<Personnel | null>(null);
  const [personnelName, setPersonnelName] = useState('');
  const [personnelEmail, setPersonnelEmail] = useState('');
  const [personnelTitle, setPersonnelTitle] = useState('');
  const [personnelRole, setPersonnelRole] = useState<Role>('viewer');

  // State for Category Form
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const archivedProjects = projects.filter(p => p.status === 'archived');

  const handleEditPersonnel = (person: Personnel) => {
    setPersonnelToEdit(person);
    setPersonnelName(person.name);
    setPersonnelEmail(person.email);
    setPersonnelTitle(person.title || '');
    setPersonnelRole(person.role);
  };
  
  const resetPersonnelForm = () => {
    setPersonnelToEdit(null);
    setPersonnelName('');
    setPersonnelEmail('');
    setPersonnelTitle('');
    setPersonnelRole('viewer');
  }

  const handlePersonnelSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!personnelName.trim() || !personnelEmail.trim()) {
        alert('請填寫姓名與Email。');
        return;
    }
    const data = { name: personnelName, email: personnelEmail, title: personnelTitle.trim() || undefined, role: personnelRole };
    if (personnelToEdit) {
        onSavePersonnel({ ...data, id: personnelToEdit.id });
    } else {
        onSavePersonnel(data);
    }
    resetPersonnelForm();
  };

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setCategoryName(category.name);
  }

  const resetCategoryForm = () => {
    setCategoryToEdit(null);
    setCategoryName('');
  }

  const handleCategorySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
        alert('請填寫分類名稱。');
        return;
    }
    const data = { name: categoryName };
    if (categoryToEdit) {
        onSaveCategory({ ...data, id: categoryToEdit.id });
    } else {
        onSaveCategory(data);
    }
    resetCategoryForm();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
           <h2 className="text-2xl font-bold text-slate-900">設定中心</h2>
           <p className="text-sm text-slate-500 mt-1">管理您的人員、專案分類與封存的專案。</p>
        </div>
        
        <div className="flex border-b border-slate-200">
            <button onClick={() => setActiveTab('personnel')} className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'personnel' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <UsersIcon className="h-5 w-5" /> 人員管理
            </button>
            <button onClick={() => setActiveTab('categories')} className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'categories' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <TagIcon className="h-5 w-5" /> 分類管理
            </button>
            <button onClick={() => setActiveTab('trash')} className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'trash' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <TrashIcon className="h-5 w-5" /> 垃圾桶 ({archivedProjects.length})
            </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
            {activeTab === 'personnel' && (
                <div>
                    <form onSubmit={handlePersonnelSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 mb-6">
                         <h3 className="text-lg font-semibold text-slate-800">{personnelToEdit ? '編輯人員' : '新增人員'}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input type="text" placeholder="姓名 *" value={personnelName} onChange={e => setPersonnelName(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm" required />
                            <input type="email" placeholder="Email *" value={personnelEmail} onChange={e => setPersonnelEmail(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm" required />
                            <input type="text" placeholder="職稱 (例如: 經理)" value={personnelTitle} onChange={e => setPersonnelTitle(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
                            <select value={personnelRole} onChange={e => setPersonnelRole(e.target.value as Role)} className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm" required>
                                <option value="admin">一級權限</option>
                                <option value="editor">二級權限</option>
                                <option value="viewer">三級權限</option>
                            </select>
                         </div>
                         <div className="flex justify-end space-x-2">
                            {personnelToEdit && <button type="button" onClick={resetPersonnelForm} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">取消編輯</button>}
                            <button type="submit" className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                                {personnelToEdit ? '儲存變更' : '新增人員'}
                            </button>
                         </div>
                    </form>
                    <div className="space-y-2">
                        {personnel.map(p => (
                            <div key={p.id} className="grid grid-cols-[1fr_auto] items-center p-3 bg-white border border-slate-200 rounded-md gap-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                                    <p className="text-sm text-slate-500 truncate">{p.email}</p>
                                    <p className="text-sm text-slate-500 truncate">{p.title || 'N/A'}</p>
                                    <span className="text-sm text-slate-600 font-medium bg-slate-200 px-2 py-0.5 rounded-full justify-self-start">{roleMap[p.role]}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => handleEditPersonnel(p)} className="text-slate-500 hover:text-indigo-600"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => onDeletePersonnel(p.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'categories' && (
                 <div>
                    <form onSubmit={handleCategorySubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4 mb-6">
                         <div className="flex-grow">
                            <label htmlFor="categoryName" className="sr-only">分類名稱</label>
                            <input id="categoryName" type="text" placeholder={categoryToEdit ? '編輯分類名稱' : '新增分類名稱'} value={categoryName} onChange={e => setCategoryName(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm" required />
                         </div>
                         <div className="flex-shrink-0 flex items-center space-x-2">
                            {categoryToEdit && <button type="button" onClick={resetCategoryForm} className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">取消</button>}
                            <button type="submit" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                                <PlusIcon className="h-4 w-4" /> {categoryToEdit ? '儲存' : '新增'}
                            </button>
                         </div>
                    </form>
                    <div className="space-y-2">
                        {categories.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md">
                                <p className="font-semibold text-slate-800">{c.name}</p>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => handleEditCategory(c)} className="text-slate-500 hover:text-indigo-600"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => onDeleteCategory(c.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {activeTab === 'trash' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">已封存的專案</h3>
                    <p className="text-sm text-slate-500 mb-6">這裡的專案已從主畫面中移除。您可以選擇將它們復原，或是永久刪除。</p>
                    <div className="space-y-2">
                        {archivedProjects.length > 0 ? archivedProjects.map(p => (
                            <div key={p.id} className="grid grid-cols-[1fr_auto] items-center p-3 bg-white border border-slate-200 rounded-md gap-4">
                                <div>
                                    <p className="font-semibold text-slate-800">{p.name}</p>
                                    <p className="text-sm text-slate-500">分類: {categories.find(c => c.id === p.categoryId)?.name || 'N/A'}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => onRestoreProject(p.id)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700" title="復原專案">
                                        <RestoreIcon className="h-4 w-4"/>
                                        <span>復原</span>
                                    </button>
                                    <button onClick={() => onPermanentlyDeleteProject(p.id)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700" title="永久刪除">
                                        <TrashIcon className="h-4 w-4"/>
                                        <span>永久刪除</span>
                                    </button>
                                </div>
                            </div>
                        )) : <p className="text-slate-500 text-center py-4">垃圾桶是空的。</p>}
                    </div>
                </div>
            )}
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end mt-auto border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              關閉
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;