// components/TodoApp/validation.ts

import { z } from 'zod';

export const todoSchema = z.object({
  text: z.string()
    .min(1, 'The task name is required')
    .max(100, 'The name should not exceed 100 characters'),
  description: z.string()
    .max(500, 'The description should not exceed 500 characters')
    .optional(),
  dueDate: z.string()
    .refine((date) => {
      if (!date) return true; // Необязательное поле
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'incorrect data format')
    .optional(),
  location: z.string()
    .max(200, 'The location should not exceed 200 characters')
    .optional(),
});

export type TodoFormData = z.infer<typeof todoSchema>;