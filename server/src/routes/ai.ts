import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { GenerateAISchema } from '../validators.js';
import { env } from '../env.js';
import OpenAI from 'openai';

export const aiRouter = Router();

/**
 * POST /api/ai/generate { topic }
 * Server-side only. Wraps OpenAI.
 */
aiRouter.post('/ai/generate', requireAuth, async (req, res, next) => {
  try {
    const { topic } = GenerateAISchema.parse(req.body);
    if (!env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'OPENAI_API_KEY is not configured on the server' });
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise social copywriter. Generate compact post ideas (1-2 sentences).',
        },
        {
          role: 'user',
          content: `Generate a catchy post idea about: ${topic}. Keep it within 2 sentences.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    });

    const idea =
      completion.choices[0]?.message?.content?.trim() || 'No idea generated.';
    return res.json({ idea });
  } catch (e) {
    next(e);
  }
});
