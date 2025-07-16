export type Role = 'admin' | 'editor' | 'viewer';

export interface ReminderSetting {
  enabled: boolean;
  daysBefore: number;
  reminderTime: string; // e.g., "09:00"
}

export interface Personnel {
  id: number;
  name: string;
  email: string;
  title?: string; // e.g., "經理", "副理"
  role: Role;
}

export interface Category {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  categoryId: number;
  dueDate: string; // YYYY-MM-DD format
  assigneeIds: number[];
  supervisorIds: number[];
  notes: string;
  reminders: {
    email: ReminderSetting;
    line: ReminderSetting;
  };
  completionDate: string | null; // e.g., "YYYY-MM-DD" or null
  localPath?: string;
  status: 'active' | 'archived';
}

export interface PendingReminder {
  project: Project;
  type: 'email' | 'line';
}