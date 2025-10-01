// components/TodoApp/validation.ts
import { z } from 'zod';

export const todoSchema = z.object({
  text: z.string()
    .min(1, 'Название задачи обязательно')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z.string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
  dueDate: z.string()
    .refine((date) => {
      if (!date) return true; // Необязательное поле
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Дата выполнения не может быть в прошлом')
    .optional(),
  location: z.string()
    .max(200, 'Местоположение не должно превышать 200 символов')
    .optional(),
});

export type TodoFormData = z.infer<typeof todoSchema>;