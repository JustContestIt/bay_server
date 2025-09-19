import { z } from "zod";
import "dotenv/config";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be a sufficiently long secret"),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional()
});

export const env = EnvSchema.parse(process.env);
