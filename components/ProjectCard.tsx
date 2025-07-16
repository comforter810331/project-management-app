import React from 'react';
import { Project, ReminderSetting, Role } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EmailIcon } from './icons/EmailIcon';
import { LineIcon } from './icons/LineIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UserIcon } from './icons/UserIcon';
import { NoteIcon } from './icons/NoteIcon';
import { PencilIcon } from './icons/PencilIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { FolderIcon } from './icons/FolderIcon';

interface ProjectCardProps {
  project: Project;
  categoryName: string;
  assigneeNames: string[];
  supervisorNames: string[];
  onDelete: (id: number) => void;
  onEdit: (project: Project) => void;
  onToggleCompletion: (id: number) => void;
  userRole: Role;
  onSendCombinedEmail: (project: Project) => void;
  onSendLine: (project: Project) => void;
  onSendLineSupervisor: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  categoryName, 
  assigneeNames, 
  supervisorNames, 
  onDelete, 
  onEdit, 
  onToggleCompletion, 
  userRole, 
  onSendCombinedEmail,
  onSendLine, 
  onSendLineSupervisor 
}) => {
  const isCompleted = !!project.completionDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(project.dueDate);
  const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
  const normalizedDueDate = new Date(dueDate.getTime() + userTimezoneOffset);
  normalizedDueDate.setHours(0, 0, 0, 0);

  const isOverdue = !isCompleted && normalizedDueDate < today;
  const daysDiff = Math.ceil((normalizedDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getDueDateText = () => {
    if (isCompleted) {
        return `於 ${project.completionDate} 完成`;
    }
    if (isOverdue) {
        return `已逾期 ${Math.abs(daysDiff)} 天`;
    }
    if(daysDiff === 0) {
        return '今天到期';
    }
    return `還剩 ${daysDiff} 天`;
  };
  
  const isTodayExactReminderDay = (reminder: ReminderSetting): boolean => {
    if (isCompleted || !reminder.enabled || reminder.daysBefore < 0) {
        return false;
    }
    const reminderDate = new Date(normalizedDueDate);
    reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
    
    return today.getTime() === reminderDate.getTime();
  }

  const isEmailReminderDay = isTodayExactReminderDay(project.reminders.email);
  const isLineReminderDay = isTodayExactReminderDay(project.reminders.line);
  
  const cardBorderColor = isCompleted ? 'border-green-500' : isOverdue ? 'border-red-500' : 'border-indigo-500';
  const dueDateColorClass = isCompleted ? 'text-green-800 bg-green-100' : isOverdue ? 'text-red-600 bg-red-100' : 'text-cyan-800 bg-cyan-100';

  const handleCopyPath = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.localPath) {
        navigator.clipboard.writeText(project.localPath)
            .then(() => alert('路徑已複製到剪貼簿！'))
            .catch(err => {
                console.error('複製失敗:', err);
                alert('複製失敗。');
            });
    }
  };

  const canEditProject = userRole === 'admin' || userRole === 'editor';
  const isEmailReminderEnabled = project.reminders.email.enabled && !isCompleted;
  const isLineReminderEnabled = project.reminders.line.enabled && !isCompleted;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border-l-4 ${cardBorderColor} ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className={`text-lg font-bold text-slate-800 leading-tight pr-2 flex-grow ${isCompleted ? 'line-through' : ''}`}>{project.name}</h3>
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {canEditProject && (
              <button
                  onClick={() => onToggleCompletion(project.id)}
                  className={`p-1 rounded-full transition-colors ${isCompleted ? 'text-white bg-green-500 hover:bg-green-600' : 'text-slate-400 hover:bg-slate-100 hover:text-green-600'}`}
                  aria-label={isCompleted ? '標示為未完成' : '標示為已完成'}
                  title={isCompleted ? '標示為未完成' : '標示為已完成'}
                >
                  <CheckIcon className="h-5 w-5" />
              </button>
            )}
            {canEditProject && (
              <>
                <button
                  onClick={() => onEdit(project)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  aria-label="編輯專案"
                  title="編輯專案"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  aria-label="封存專案"
                  title="封存專案"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {categoryName && (
            <div className="mt-2">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                    {categoryName}
                </span>
            </div>
        )}

        <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-3 text-slate-400"/>
                <div>
                    <span>{project.dueDate}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${dueDateColorClass}`}>{getDueDateText()}</span>
                </div>
            </div>
            <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-3 text-slate-400"/>
                <span className="truncate">{assigneeNames.join(', ') || '未指派'}</span>
            </div>
            <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-3 text-slate-400"/>
                <span className="truncate">{supervisorNames.join(', ') || '未設定'}</span>
            </div>
            {project.localPath && (
              <div className="flex items-start">
                  <FolderIcon className="h-5 w-5 mr-3 text-slate-400 mt-0.5 flex-shrink-0"/>
                  <div className="flex items-center gap-2 overflow-hidden">
                      <a href={`file://${project.localPath}`} title="點擊以嘗試開啟資料夾 (可能因瀏覽器安全限制而失敗)" className="text-sm text-indigo-600 hover:underline truncate cursor-pointer">
                          {project.localPath}
                      </a>
                      <button 
                          onClick={handleCopyPath}
                          className="text-xs text-slate-500 hover:text-indigo-700 p-1 rounded hover:bg-slate-200 transition-colors flex-shrink-0"
                          title="複製路徑"
                      >
                          複製
                      </button>
                  </div>
              </div>
            )}
             <div className="flex items-start">
                <NoteIcon className="h-5 w-5 mr-3 text-slate-400 mt-0.5 flex-shrink-0"/>
                <p className="whitespace-pre-wrap text-slate-500 text-sm leading-relaxed">{project.notes}</p>
            </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 mt-auto rounded-b-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">快速操作</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSendCombinedEmail(project)}
                disabled={!isEmailReminderEnabled || project.assigneeIds.length === 0}
                className={`p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-sky-100 transition-colors ${isEmailReminderDay ? 'animate-pulse-reminder' : ''}`}
                title={
                    !isEmailReminderEnabled ? "Email 提醒未啟用或專案已完成" :
                    project.assigneeIds.length === 0 ? "未指派辦理人" : 
                    project.supervisorIds.length > 0 ? "寄送 Email 給辦理人 (副本給主管)" : "寄送 Email 給辦理人"
                }
                aria-label="寄送 Email 提醒"
              >
                  <EmailIcon className="h-5 w-5 text-sky-600" />
              </button>
              
              <div className="border-l border-slate-300 h-6 mx-1"></div>

              <button
                onClick={() => onSendLine(project)}
                disabled={!isLineReminderEnabled || project.assigneeIds.length === 0}
                className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-emerald-100 transition-colors"
                title={
                    !isLineReminderEnabled ? "LINE 提醒未啟用或專案已完成" :
                    project.assigneeIds.length === 0 ? "未指派辦理人" : "複製辦理人 LINE 提醒"
                }
                aria-label="複製辦理人 LINE 提醒訊息"
              >
                  <UserIcon className={`h-5 w-5 text-emerald-600 ${isLineReminderDay && project.assigneeIds.length > 0 ? 'animate-pulse-reminder' : ''}`} />
              </button>
              
              <button
                onClick={() => onSendLineSupervisor(project)}
                disabled={!isLineReminderEnabled || project.supervisorIds.length === 0}
                className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-amber-100 transition-colors"
                title={
                    !isLineReminderEnabled ? "LINE 提醒未啟用或專案已完成" :
                    project.supervisorIds.length === 0 ? "未設定主管" : "複製主管 LINE 提醒"
                }
                aria-label="複製主管 LINE 提醒訊息"
              >
                  <BriefcaseIcon className={`h-5 w-5 text-amber-600 ${isLineReminderDay && project.supervisorIds.length > 0 ? 'animate-pulse-reminder' : ''}`} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProjectCard;