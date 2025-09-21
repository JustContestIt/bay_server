import { Router } from 'express';
import { prisma } from '../prisma.js';
import {
  CreatePostSchema,
  PaginationSchema,
  CommentSchema,
} from '../validators.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { parseQuery } from '../services/search.js';
import { createNotification } from '../services/notifications.js';

export const postsRouter = Router();

/**
 * POST /api/posts { content }
 */
postsRouter.post('/posts', requireAuth, async (req, res, next) => {
  try {
    const { content } = CreatePostSchema.parse(req.body);
    console.log(content);
    const post = await prisma.post.create({
      data: {
        content,
        authorId: String(req.user!.id),
      },
      include: {
        author: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    console.log('Created post:', post);
    return res.json(serializePost(post, req.user!.id));
  } catch (e) {
    console.log('Error creating post:', e);
    next(e);
  }
});

/**
 * GET /api/posts?q?&cursor?&limit?
 * Cursor = last seen id (pagination by id DESC)
 */
postsRouter.get('/posts', optionalAuth, async (req, res, next) => {
  try {
    const { q, cursor, limit } = PaginationSchema.parse(req.query);
    const parsed = parseQuery(q);

    const where = q
      ? {
          AND: [
            {
              OR: [
                ...parsed.keywords.map((kw) => ({
                  content: { contains: kw, mode: 'insensitive' as const },
                })),
                ...parsed.hashtags.map((tag) => ({
                  content: { contains: tag, mode: 'insensitive' as const },
                })),
              ],
            },
          ],
        }
      : {};

    const posts = await prisma.post.findMany({
      where: q
        ? { content: { contains: q } }
        : undefined,
      orderBy: { id: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: String(cursor) }, skip: 1 } : {}),
      include: {
        author: true,
        likes: req.user
          ? { where: { userId: String(req.user.id) }, select: { id: true } }
          : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;
    const meId = req.user?.id ?? null;
    return res.json({
      items: posts.map((p: any) => serializePost(p as any, meId)),
      nextCursor,
    });
  } catch (e) {
    console.log('Error fetching posts:', e);
    next(e);
  }
});

/**
 * POST /api/posts/:id/like -> toggle like
 */
postsRouter.post('/posts/:id/like', requireAuth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    console.log(postId);
    if (postId.length === 0)
      return res.status(400).json({ error: 'Invalid post id' });

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: String(req.user!.id), postId: String(postId) } },
      include: { post: { select: { authorId: true } } },
    });
    console.log(`Found existing like:`, existing);

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      const like = await prisma.like.create({
        data: { userId: String(req.user!.id), postId: String(postId) },
        include: { post: { select: { authorId: true } } },
      });
      await createNotification({
        userId: like.post.authorId,
        actorId: String(req.user!.id),
        type: 'LIKE',
        postId,
      });
      return res.json({ liked: true });
    }
  } catch (e) {
    console.log('Error toggling like:', e);
    next(e);
  }
});

/**
 * POST /api/posts/:id/comments { content }
 */
postsRouter.post('/posts/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    console.log(postId);
    if (postId.length === 0)
      return res.status(400).json({ error: 'Invalid post id' });

    const { content } = CommentSchema.parse(req.body);
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: String(postId),
        authorId: String(req.user!.id),
      },
      include: { author: true, post: { select: { authorId: true } } },
    });

    await createNotification({
      userId: comment.post.authorId,
      actorId: String(req.user!.id),
      type: 'COMMENT',
      postId,
    });

    return res.json({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.authorId,
        username: comment.author.username,
        displayName: comment.author.displayName,
      },
      createdAt: comment.createdAt,
    });
  } catch (e) {
    console.log('Error creating comment:', e);
    next(e);
  }
});

// helpers
function serializePost(post: any, meId: number | null) {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      displayName: post.author.displayName,
    },
    likesCount: post._count?.likes ?? 0,
    commentsCount: post._count?.comments ?? 0,
    isLiked: meId
      ? Array.isArray(post.likes)
        ? post.likes.length > 0
        : false
      : false,
  };
}
