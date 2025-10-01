// components/TodoApp/types.ts

export interface Todo {
  id: string;
  text: string;
  description?: string;
  dueDate?: string; // ISO string or YYYY-MM-DD
  location?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completed: boolean;
  createdAt: string;
}

export enum FilterType {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  CANCELLED = 'cancelled'
}

export enum SortType {
  DATE_ADDED = 'date-added',
  DUE_DATE = 'due-date',
  STATUS = 'status'
}