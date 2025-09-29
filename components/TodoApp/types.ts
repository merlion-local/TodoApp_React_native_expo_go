// components/TodoApp/types.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export enum FilterType {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}