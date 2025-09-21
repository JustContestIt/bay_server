// server/src/env.ts
import { z } from 'zod';
import * as path from 'node:path';
import * as url from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be a sufficiently long secret'),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
