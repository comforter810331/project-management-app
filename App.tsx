import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Project, Personnel, Category, Role, PendingReminder } from './types';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import AddProjectModal from './components/AddProjectModal';
import SettingsModal from './components/SettingsModal';
import { PlusIcon } from './components/icons/PlusIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import CompletionDateModal from './components/CompletionDateModal';
import LoginScreen from './components/LoginScreen';
import UnauthorizedScreen from './components/UnauthorizedScreen';
import { useAuth } from './auth/auth';
import * as XLSX from 'xlsx';
import { SearchIcon } from './components/icons/SearchIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import ReminderDashboardModal from './components/ReminderDashboardModal';

const App: React.FC = () => {
  const { user, isAuthorized, isLoading, logout } = useAuth();
  
  // --- DATABASE STATES ---
  const [personnel, setPersonnel] = useState<Personnel[]>([
    { id: 1, name: '陳小明', email: 'ming.chen@example.com', role: 'editor' },
    { id: 2, name: '林美麗', email: 'mei.lin@example.com', role: 'editor' },
    { id: 3, name: '張大偉', email: 'david.chang@example.com', role: 'viewer' },
    { id: 4, name: '王經理', email: 'manager.wang@example.com', title: '經理', role: 'admin' },
    { id: 5, name: '技術支援部', email: 'it-support@example.com', role: 'viewer' },
    { id: 6, name: '戎書甫', email: 'souby0000@gmail.com', title: '副理', role: 'admin' },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: '行銷活動' },
    { id: 2, name: '客戶關係' },
    { id: 3, name: '開發專案' },
    { id: 4, name: '技術維護' },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: '2024 Q3 產品發表會籌備',
      categoryId: 1,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigneeIds: [1, 6], // Assignee: 小明 and 副理
      supervisorIds: [4],
      notes: '1. 確認場地與設備\n2. 設計邀請函與宣傳材料\n3. 安排演講者與議程',
      reminders: {
        email: { enabled: true, daysBefore: 2, reminderTime: '09:00' },
        line: { enabled: true, daysBefore: 2, reminderTime: '10:00' }
      },
      completionDate: null,
      localPath: 'D:\\Projects\\2024\\Q3_Product_Launch',
      status: 'active',
    },
    {
      id: 2,
      name: '年度客戶滿意度調查',
      categoryId: 2,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigneeIds: [2],
      supervisorIds: [4],
      notes: '設計問卷，並透過電子郵件發送給所有活躍客戶。',
      reminders: {
        email: { enabled: true, daysBefore: 2, reminderTime: '14:00' },
        line: { enabled: false, daysBefore: 0, reminderTime: '09:00' }
      },
      completionDate: null,
      status: 'active',
    },
     {
      id: 4,
      name: '伺服器硬體升級',
      categoryId: 4,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigneeIds: [5],
      supervisorIds: [4],
      notes: '採購新的伺服器並安排停機時間進行轉移。',
      reminders: {
        email: { enabled: true, daysBefore: 3, reminderTime: '08:30' },
        line: { enabled: true, daysBefore: 3, reminderTime: '08:30' }
      },
      completionDate: '2024-07-20',
      localPath: '\\\\SERVER_MAIN\\it_projects\\server_upgrade_2024',
      status: 'active',
    },
    {
      id: 3,
      name: '網站首頁 UI/UX redesign',
      categoryId: 3,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigneeIds: [3],
      supervisorIds: [4],
      notes: '與設計團隊合作，提出至少兩種新版設計方案。',
      reminders: {
        email: { enabled: false, daysBefore: 0, reminderTime: '09:00' },
        line: { enabled: true, daysBefore: 14, reminderTime: '18:00' }
      },
      completionDate: null,
      status: 'active',
    },
  ]);

  // --- MODAL STATES ---
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [completingProjectId, setCompletingProjectId] = useState<number | null>(null);

  
  // --- FILTER & REF STATES ---
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'uncompleted' | 'completed' | 'all'>('uncompleted');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  // --- DATA MAPPING LOOKUPS ---
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const personnelMap = useMemo(() => new Map(personnel.map(p => [p.id, p])), [personnel]);
  const categoryNameToIdMap = useMemo(() => new Map(categories.map(c => [c.name, c.id])), [categories]);
  const personnelNameToIdMap = useMemo(() => new Map(personnel.map(p => [p.name, p.id])), [personnel]);
  
  // --- SETTINGS MODAL HANDLERS ---
  const handleSavePersonnel = (person: Omit<Personnel, 'id'> | Personnel) => {
    setPersonnel(prev => {
        if ('id' in person) {
            return prev.map(p => p.id === person.id ? person : p);
        }
        const newId = Math.max(0, ...prev.map(p => p.id)) + 1;
        return [...prev, { ...person, id: newId }];
    });
  };

  const handleDeletePersonnel = (id: number) => {
    if (projects.some(p => p.status === 'active' && (p.assigneeIds.includes(id) || p.supervisorIds.includes(id)))) {
        alert('無法刪除此人員，因為他仍被指派至一個或多個「有效」專案中。請先將相關專案的辦理人或主管移除，或將專案封存，然後再試一次。');
        return;
    }
    setPersonnel(prev => prev.filter(p => p.id !== id));
  };
  
  const handleSaveCategory = (category: Omit<Category, 'id'> | Category) => {
      setCategories(prev => {
          if ('id' in category) {
              return prev.map(c => c.id === category.id ? category : c);
          }
          const newId = Math.max(0, ...prev.map(c => c.id)) + 1;
          return [...prev, { ...category, id: newId }];
      });
  };

  const handleDeleteCategory = (id: number) => {
      if (projects.some(p => p.status === 'active' && p.categoryId === id)) {
          alert('無法刪除此分類，因為它已被一個或多個「有效」專案使用。請先更改相關專案的分類，或將專案封存，然後再試一次。');
          return;
      }
      setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleRestoreProject = (id: number) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === id ? { ...p, status: 'active' } : p)
    );
  };

  const handlePermanentlyDeleteProject = (id: number) => {
    if (window.confirm('您確定要永久刪除這個專案嗎？此操作無法復原。')) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
    }
  };

  // --- REMINDER ACTION HANDLERS ---
  const handleSendCombinedEmail = useCallback((project: Project) => {
    const assignees = project.assigneeIds.map(id => personnelMap.get(id)?.email).filter(Boolean);
    const supervisors = project.supervisorIds.map(id => personnelMap.get(id)?.email).filter(Boolean);

    if (assignees.length === 0) {
        alert('此專案沒有設定辦理人 Email，無法寄送。');
        return;
    }

    const subject = `專案提醒：【${project.name}】即將於 ${project.dueDate} 到期`;
    const body = `您好：

此信件為系統自動發送的專案提醒。

專案名稱：${project.name}
到期日期：${project.dueDate}
辦理人：${project.assigneeIds.map(id => personnelMap.get(id)?.name || 'N/A').join(', ')}
主管：${project.supervisorIds.length > 0 ? project.supervisorIds.map(id => personnelMap.get(id)?.name || 'N/A').join(', ') : '未設定'}

專案備註：
${project.notes}

請確認專案進度，謝謝。

--
本信件由專案管理系統發送`;

    const to = assignees.join(',');
    const cc = supervisors.join(',');

    let mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (cc) {
        mailtoLink += `&cc=${encodeURIComponent(cc)}`;
    }

    window.location.href = mailtoLink;
  }, [personnelMap]);

  const handleSendLine = useCallback((project: Project) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(project.dueDate);
    const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
    const normalizedDueDate = new Date(dueDate.getTime() + userTimezoneOffset);
    normalizedDueDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((normalizedDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const getDueDateText = () => {
        if (daysDiff < 0) return `已逾期 ${Math.abs(daysDiff)} 天`;
        if (daysDiff === 0) return '今天到期';
        return `還剩 ${daysDiff} 天`;
    };
    const dueDateText = getDueDateText();

    const managerTitles = ['經理', '副理', '協理', '處長', '總監'];

    const messages = project.assigneeIds.map(id => {
        const person = personnelMap.get(id);
        if (!person) return null;

        const lastName = person.name.substring(0, 1);
        
        if (person.title && managerTitles.includes(person.title)) {
            // Manager format
            return `報告 ${lastName}${person.title}，提醒您，「${project.name}」${dueDateText}(到期日: ${project.dueDate})，請留意案件進度，謝謝。`;
        } else {
            // Colleague format
            return `${person.name}，「${project.name}」${dueDateText}(到期日: ${project.dueDate})。以上提醒。`;
        }
    }).filter((message): message is string => message !== null);

    if (messages.length === 0) {
         alert('此專案沒有設定可提醒的辦理人。');
         return;
    }

    const finalMessage = messages.join('\n\n');

    navigator.clipboard.writeText(finalMessage).then(() => {
        alert('LINE 提醒訊息已複製到剪貼簿！');
    }).catch(err => {
        console.error('無法複製訊息: ', err);
        alert('複製訊息失敗，請檢查瀏覽器權限設定。');
    });
  }, [personnelMap]);

  const handleSendLineSupervisor = useCallback((project: Project) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(project.dueDate);
    const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
    const normalizedDueDate = new Date(dueDate.getTime() + userTimezoneOffset);
    normalizedDueDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((normalizedDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const getDueDateText = () => {
        if (daysDiff < 0) return `已逾期 ${Math.abs(daysDiff)} 天`;
        if (daysDiff === 0) return '今天到期';
        return `還剩 ${daysDiff} 天`;
    };
    const dueDateText = getDueDateText();

    const messages = project.supervisorIds.map(id => {
        const person = personnelMap.get(id);
        if (!person) return null;

        const lastName = person.name.substring(0, 1);
        const title = person.title || '主管';
        
        return `報告 ${lastName}${title}，您好，關於您所督導的專案「${project.name}」${dueDateText}(到期日: ${project.dueDate})，請您留意案件進度，謝謝。`;
        
    }).filter((message): message is string => message !== null);

    if (messages.length === 0) {
         alert('此專案沒有設定可提醒的主管。');
         return;
    }

    const finalMessage = messages.join('\n\n');

    navigator.clipboard.writeText(finalMessage).then(() => {
        alert('給主管的 LINE 提醒訊息已複製到剪貼簿！');
    }).catch(err => {
        console.error('無法複製訊息: ', err);
        alert('複製訊息失敗，請檢查瀏覽器權限設定。');
    });
  }, [personnelMap]);


  // --- PROJECT MODAL & CARD HANDLERS ---
  const handleOpenAddModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'completionDate' | 'status'>) => {
    if (projectToEdit) {
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === projectToEdit.id ? { ...projectToEdit, ...projectData } : p))
      );
    } else {
      setProjects(prevProjects => [
        ...prevProjects,
        { ...projectData, id: Date.now(), completionDate: null, status: 'active' },
      ]);
    }
    handleCloseProjectModal();
  };

  const handleArchiveProject = (id: number) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === id ? { ...p, status: 'archived' } : p)
    );
  };

  const handleToggleCompletion = (id: number) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    if (project.completionDate) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, completionDate: null } : p));
    } else {
      setCompletingProjectId(id);
    }
  };
  
  const handleConfirmCompletion = (date: string) => {
    if (!completingProjectId) return;
    setProjects(prev => prev.map(p => p.id === completingProjectId ? { ...p, completionDate: date } : p));
    setCompletingProjectId(null);
  };

  const handleCancelCompletion = () => {
    setCompletingProjectId(null);
  };

  // --- Data & Filtering Logic ---
  const pendingReminders = useMemo((): PendingReminder[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminders: PendingReminder[] = [];

    projects.forEach(project => {
      if (project.status !== 'active' || project.completionDate) {
        return;
      }

      const dueDate = new Date(project.dueDate);
      const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
      const normalizedDueDate = new Date(dueDate.getTime() + userTimezoneOffset);
      normalizedDueDate.setHours(0, 0, 0, 0);

      const checkReminder = (type: 'email' | 'line') => {
        const setting = project.reminders[type];
        if (setting.enabled && setting.daysBefore > 0) {
          const reminderStartDate = new Date(normalizedDueDate);
          reminderStartDate.setDate(reminderStartDate.getDate() - setting.daysBefore + 1); // Reminder window starts on this day
          
          if (today >= reminderStartDate && today <= normalizedDueDate) {
            reminders.push({ project, type });
          }
        }
      };
      
      // Check if today is exactly the reminder day
       const checkExactReminderDay = (type: 'email' | 'line') => {
           const setting = project.reminders[type];
           if (setting.enabled && setting.daysBefore >= 0) {
                const reminderDay = new Date(normalizedDueDate);
                reminderDay.setDate(reminderDay.getDate() - setting.daysBefore);
                if(reminderDay.getTime() === today.getTime()){
                    reminders.push({ project, type });
                }
           }
       };

      checkExactReminderDay('email');
      checkExactReminderDay('line');
    });
    
    // Remove duplicates if a project has both reminders for today
    const uniqueReminders = Array.from(new Map(reminders.map(r => [`${r.project.id}-${r.type}`, r])).values());
    return uniqueReminders;
  }, [projects]);


  const filteredProjects = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
    return projects
      .filter(p => p.status === 'active')
      .filter(p => selectedCategory === 'all' || p.categoryId === Number(selectedCategory))
      .filter(p => {
          if (statusFilter === 'all') return true;
          const isCompleted = !!p.completionDate;
          return statusFilter === 'completed' ? isCompleted : !isCompleted;
      })
      .filter(p => {
        if (lowercasedSearchTerm === '') return true;
        const nameMatch = p.name.toLowerCase().includes(lowercasedSearchTerm);
        const notesMatch = p.notes.toLowerCase().includes(lowercasedSearchTerm);
        return nameMatch || notesMatch;
      });
  }, [projects, selectedCategory, statusFilter, searchTerm]);

  const groupedProjects = filteredProjects.reduce((acc, project) => {
    const categoryName = categoryMap.get(project.categoryId) || '未分類';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  const sortedCategories = Object.keys(groupedProjects).sort((a, b) => a === '未分類' ? 1 : b === '未分類' ? -1 : a.localeCompare(b));

  // --- Excel Import/Export ---
  const handleExportToExcel = useCallback(() => {
    if (filteredProjects.length === 0) {
        alert('沒有可匯出的專案。請先新增或調整篩選條件。');
        return;
    }

    const getPersonnelNames = (ids: number[]) => ids.map(id => personnelMap.get(id)?.name || '未知人員').join(', ');
    
    const formattedData = filteredProjects.map(p => ({
        '狀態': p.completionDate ? '已完成' : '未完成',
        '完成日期': p.completionDate || 'N/A',
        '專案名稱': p.name,
        '分類': categoryMap.get(p.categoryId) || 'N/A',
        '到期日': p.dueDate,
        '辦理人': getPersonnelNames(p.assigneeIds),
        '主管': getPersonnelNames(p.supervisorIds),
        'Email提醒': p.reminders.email.enabled ? `啟用 (前 ${p.reminders.email.daysBefore} 天, ${p.reminders.email.reminderTime})` : '停用',
        'LINE提醒': p.reminders.line.enabled ? `啟用 (前 ${p.reminders.line.daysBefore} 天, ${p.reminders.line.reminderTime})` : '停用',
        '備註': p.notes,
        '資料夾路徑': p.localPath || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '專案報告');

    worksheet['!cols'] = [
        { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 25 },
        { wch: 25 }, { wch: 25 }, { wch: 50 }, { wch: 50 }
    ];

    const today = new Date().toISOString().split('T')[0];
    const filterName = selectedCategory === 'all' ? '所有分類' : categoryMap.get(Number(selectedCategory)) || '分類';
    XLSX.writeFile(workbook, `專案報告_${filterName}_${today}.xlsx`);
  }, [filteredProjects, selectedCategory, categoryMap, personnelMap]);
  
  const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array', cellDates:true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const newProjects: Omit<Project, 'id'>[] = json.map((row, index) => {
                const getIdsFromName = (nameStr: string) => (nameStr || '').split(',').map(name => name.trim()).map(name => personnelNameToIdMap.get(name)).filter((id): id is number => id !== undefined);

                const parseReminder = (reminderStr: string) => {
                    if (!reminderStr || reminderStr === '停用') return { enabled: false, daysBefore: 0, reminderTime: '09:00' };
                    const match = reminderStr.match(/前 (\d+) 天, (\d{2}:\d{2})/);
                    return {
                        enabled: true,
                        daysBefore: match ? parseInt(match[1], 10) : 1,
                        reminderTime: match ? match[2] : '09:00',
                    };
                };
                
                let dueDate = row['到期日'];
                if(dueDate instanceof Date){
                  // Keep timezone offset
                  dueDate.setMinutes(dueDate.getMinutes() - dueDate.getTimezoneOffset());
                  dueDate = dueDate.toISOString().split('T')[0];
                } else if (typeof dueDate === 'string' && dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  // It's already in the correct string format
                } else {
                  dueDate = new Date().toISOString().split('T')[0]; // fallback
                }
                
                const newProject: Omit<Project, 'id'> = {
                    name: row['專案名稱'] || `未命名專案 ${index + 1}`,
                    categoryId: categoryNameToIdMap.get(row['分類']) || categories[0]?.id || 0,
                    dueDate,
                    assigneeIds: getIdsFromName(row['辦理人']),
                    supervisorIds: getIdsFromName(row['主管']),
                    notes: row['備註'] || '',
                    localPath: row['資料夾路徑'] === 'N/A' ? '' : row['資料夾路徑'],
                    reminders: {
                        email: parseReminder(row['Email提醒']),
                        line: parseReminder(row['LINE提醒']),
                    },
                    completionDate: null,
                    status: 'active',
                };
                return newProject;
            }).filter(p => p.name && p.name.trim() !== '' && p.dueDate); // Filter out potentially empty rows

            if (newProjects.length > 0) {
                const projectsWithIds = newProjects.map((p, i) => ({ ...p, id: Date.now() + i }));
                setProjects(prev => [...prev, ...projectsWithIds]);
                alert(`成功匯入 ${newProjects.length} 個專案！`);
            } else {
                alert('Excel 檔案中沒有找到可匯入的專案資料。');
            }
        } catch (error) {
            console.error("Error importing from Excel:", error);
            alert('匯入失敗，請確認檔案格式是否正確。');
        } finally {
            // Reset file input to allow re-uploading the same file
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsArrayBuffer(file);
  };


  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl font-medium text-slate-600">載入中...</div>
        </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!isAuthorized) {
    return <UnauthorizedScreen user={user} onLogout={logout} />;
  }
  
  const canEditProjects = user.role === 'admin' || user.role === 'editor';

  return (
    <div className="min-h-screen bg-slate-100">
      <Header 
        onAddProject={handleOpenAddModal} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        user={user}
        onLogout={logout}
        reminderCount={pendingReminders.length}
        onOpenReminders={() => setIsReminderModalOpen(true)}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {projects.length > 0 ? (
          <>
            <div className="mb-6 flex flex-col lg:flex-row items-stretch justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow">
                    <div className="relative flex-grow w-full">
                         <label htmlFor="search-filter" className="sr-only">搜尋專案</label>
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                         </div>
                         <input
                            id="search-filter"
                            type="search"
                            placeholder="依關鍵字搜尋專案名稱或備註..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <label htmlFor="category-filter" className="text-sm font-medium text-slate-700 whitespace-nowrap">分類:</label>
                        <select 
                          id="category-filter"
                          value={selectedCategory}
                          onChange={e => setSelectedCategory(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="all">所有分類</option>
                          {categories.map(cat => (
                             <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                    </div>
                     <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">狀態:</span>
                        <div className="flex items-center space-x-2">
                           {(['uncompleted', 'completed', 'all'] as const).map(status => (
                               <label key={status} className="flex items-center space-x-1 cursor-pointer">
                                   <input
                                       type="radio"
                                       name="status-filter"
                                       value={status}
                                       checked={statusFilter === status}
                                       onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                       className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                   />
                                   <span className="text-sm text-slate-600">
                                       {status === 'uncompleted' ? '未完成' : status === 'completed' ? '已完成' : '全部'}
                                   </span>
                               </label>
                           ))}
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleImportFromExcel} accept=".xlsx, .xls" className="hidden" />
                    {canEditProjects && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                          <UploadIcon className="h-5 w-5 mr-2" />
                          匯入 Excel
                        </button>
                    )}
                    <button
                      onClick={handleExportToExcel}
                      className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                      <DownloadIcon className="h-5 w-5 mr-2" />
                      匯出 Excel
                    </button>
                </div>
            </div>
           <div className="space-y-10">
            {sortedCategories.length > 0 ? sortedCategories.map(categoryName => (
              <section key={categoryName}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-indigo-200">{categoryName}</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {groupedProjects[categoryName].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      categoryName={categoryMap.get(project.categoryId) || ''}
                      assigneeNames={project.assigneeIds.map(id => personnelMap.get(id)?.name).filter(Boolean) as string[]}
                      supervisorNames={project.supervisorIds.map(id => personnelMap.get(id)?.name).filter(Boolean) as string[]}
                      onEdit={handleOpenEditModal}
                      onDelete={handleArchiveProject}
                      onToggleCompletion={handleToggleCompletion}
                      userRole={user.role}
                      onSendCombinedEmail={handleSendCombinedEmail}
                      onSendLine={handleSendLine}
                      onSendLineSupervisor={handleSendLineSupervisor}
                    />
                  ))}
                </div>
              </section>
            )) : <p className="text-slate-500 text-center py-4">在此篩選條件下沒有專案。</p>}
          </div>
          </>
        ) : (
          <div className="text-center py-16 px-6 border-2 border-dashed border-slate-300 rounded-lg">
            <h3 className="text-xl font-semibold text-slate-600">目前沒有專案</h3>
            <p className="text-slate-500 mt-2">點擊下方的按鈕來新增您的第一個專案吧！</p>
            {canEditProjects && (
              <button
                onClick={handleOpenAddModal}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                新增專案
              </button>
            )}
          </div>
        )}
      </main>
      {isProjectModalOpen && canEditProjects && (
        <AddProjectModal
          onClose={handleCloseProjectModal}
          onSave={handleSaveProject}
          projectToEdit={projectToEdit}
          personnel={personnel}
          categories={categories}
        />
      )}
      {isSettingsModalOpen && user.role === 'admin' && (
        <SettingsModal 
          onClose={() => setIsSettingsModalOpen(false)}
          personnel={personnel}
          categories={categories}
          projects={projects}
          onSavePersonnel={handleSavePersonnel}
          onDeletePersonnel={handleDeletePersonnel}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onRestoreProject={handleRestoreProject}
          onPermanentlyDeleteProject={handlePermanentlyDeleteProject}
        />
      )}
      {completingProjectId && (
        <CompletionDateModal
          onClose={handleCancelCompletion}
          onConfirm={handleConfirmCompletion}
        />
      )}
      <ReminderDashboardModal 
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        reminders={pendingReminders}
        personnelMap={personnelMap}
        categoryMap={categoryMap}
        onSendCombinedEmail={handleSendCombinedEmail}
        onSendLine={handleSendLine}
        onSendLineSupervisor={handleSendLineSupervisor}
      />
    </div>
  );
};

export default App;