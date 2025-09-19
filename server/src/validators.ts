import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(64).optional(),
});

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const PaginationSchema = z.object({
  q: z.string().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const CommentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const GenerateAISchema = z.object({
  topic: z.string().min(1).max(120),
});
