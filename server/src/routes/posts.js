import express from 'express';
import Post from '../models/Post.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name email');
  res.json({ posts });
});

router.post('/', verifyJWT, async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const post = await Post.create({
    title,
    content,
    category: category || 'general',
    author: req.user.id
  });

  res.status(201).json({ post });
});

export default router;
