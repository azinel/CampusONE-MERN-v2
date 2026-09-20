import express from 'express';
import Comment from '../models/Comment.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:postId', async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 }).populate('author', 'name');
  res.json({ comments });
});

router.post('/:postId', verifyJWT, async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  const comment = await Comment.create({
    content,
    author: req.user.id,
    post: req.params.postId
  });

  res.status(201).json({ comment });
});

export default router;
