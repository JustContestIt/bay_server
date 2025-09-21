import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { env } from './env.js';
import { errorHandler } from './middleware/error.js';
import { initSocket } from './socket.js';
import { authRouter } from './routes/auth.js';
import { postsRouter } from './routes/posts.js';
import { usersRouter } from './routes/users.js';
import { notificationsRouter } from './routes/notifications.js';
import { aiRouter } from './routes/ai.js';

const app = express();
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', authRouter);
app.use('/api', postsRouter);
app.use('/api', usersRouter);
app.use('/api', notificationsRouter);
app.use('/api', aiRouter);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Errors
app.use(errorHandler);

const server = createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
