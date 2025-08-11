import { z } from 'zod';
import { ProjectStatus, Priority, TaskStatus } from '../types';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255, 'Task title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255, 'Task title is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required').max(255, 'Subtask title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required').max(255, 'Subtask title is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment is too long'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment is too long'),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3B82F6'),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

export const projectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'startDate', 'endDate']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'dueDate', 'priority']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

