import React from 'react';
import { PendingReminder, Personnel, Category } from '../types';
import { XIcon } from './icons/XIcon';
import { EmailIcon } from './icons/EmailIcon';
import { LineIcon } from './icons/LineIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { UserIcon } from './icons/UserIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface ReminderDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: PendingReminder[];
  personnelMap: Map<number, Personnel>;
  categoryMap: Map<number, string>;
  onSendCombinedEmail: (project: PendingReminder['project']) => void;
  onSendLine: (project: PendingReminder['project']) => void;
  onSendLineSupervisor: (project: PendingReminder['project']) => void;
}

const ReminderDashboardModal: React.FC<ReminderDashboardModalProps> = ({ 
  isOpen, 
  onClose, 
  reminders, 
  personnelMap, 
  categoryMap, 
  onSendCombinedEmail,
  onSendLine, 
  onSendLineSupervisor 
}) => {
  if (!isOpen) return null;

  const emailReminders = reminders.filter(r => r.type === 'email');
  const lineReminders = reminders.filter(r => r.type === 'line');

  const ReminderList = ({ title, icon, reminderList, actionButton }: {
    title: string,
    icon: React.ReactNode,
    reminderList: PendingReminder[],
    actionButton: (reminder: PendingReminder) => React.ReactNode
  }) => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
        {icon}
        {title} ({reminderList.length})
      </h3>
      {reminderList.length > 0 ? (
        <div className="space-y-3">
          {reminderList.map(reminder => {
            const assigneeNames = reminder.project.assigneeIds.map(id => personnelMap.get(id)?.name).filter(Boolean).join(', ');
            const supervisorNames = reminder.project.supervisorIds.map(id => personnelMap.get(id)?.name).filter(Boolean).join(', ');

            return (
              <div key={`${reminder.type}-${reminder.project.id}`} className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-grow overflow-hidden">
                  <p className="font-bold text-slate-900 truncate">{reminder.project.name}</p>
                  <p className="text-sm text-slate-500 truncate">
                    <span className="font-medium">到期日:</span> {reminder.project.dueDate} | <span className="font-medium">辦理人:</span> {assigneeNames || 'N/A'} | <span className="font-medium">主管:</span> {supervisorNames || 'N/A'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {actionButton(reminder)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500 bg-white p-4 rounded-md border border-slate-200">今日無 {title}。 </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-6 flex justify-between items-center border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">今日提醒中心</h2>
            <p className="text-sm text-slate-500 mt-1">此處列出所有今天需要發送提醒的專案。</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="p-6 space-y-6">
          <ReminderList
            title="Email 提醒"
            icon={<EmailIcon className="h-6 w-6 text-sky-600" />}
            reminderList={emailReminders}
            actionButton={(reminder) => (
              <div className="flex items-center gap-2">
                {reminder.project.assigneeIds.length > 0 && (
                   <button
                    onClick={() => onSendCombinedEmail(reminder.project)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    title={reminder.project.supervisorIds.length > 0 ? "寄送 Email 給辦理人 (副本給主管)" : "寄送 Email 給辦理人"}
                  >
                    <EmailIcon className="h-4 w-4" />
                    <span>寄送提醒</span>
                  </button>
                )}
              </div>
            )}
          />

          <ReminderList
            title="LINE 提醒"
            icon={<LineIcon className="h-6 w-6 text-emerald-600" />}
            reminderList={lineReminders}
            actionButton={(reminder) => (
              <div className="flex items-center gap-2">
                {reminder.project.assigneeIds.length > 0 && (
                   <button
                    onClick={() => onSendLine(reminder.project)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    title="複製辦理人提醒訊息"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>辦理人</span>
                  </button>
                )}
                {reminder.project.supervisorIds.length > 0 && (
                   <button
                    onClick={() => onSendLineSupervisor(reminder.project)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    title="複製主管提醒訊息"
                  >
                    <BriefcaseIcon className="h-4 w-4" />
                    <span>主管</span>
                  </button>
                )}
              </div>
            )}
          />
        </main>
        
        <footer className="bg-slate-100 px-6 py-4 flex justify-end mt-auto border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              關閉
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ReminderDashboardModal;