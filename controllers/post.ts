import { Request, Response } from 'express';

import Post from '../models/post';
import Comment from '../models/comment';
import mongoose from 'mongoose';

const createPost = async (req: Request, res: Response) => {
  const { content } = req.body;
  const { userId } = req;
  try {
    const post = await Post.create({ content, createdBy: userId });
    res
      .status(201)
      .json({ message: 'Post Created Succesfully', ok: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const updatePost = async (req: Request, res: Response) => {
  const { content } = req.body;
  const { postId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(postId))
      return res.status(404).json({ message: 'Post not found', ok: false });

    const post = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true, runValidators: true }
    );

    if (!post)
      return res.status(404).json({ message: 'Post not found', ok: false });

    res
      .status(200)
      .json({ message: 'Post updated successfully', ok: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

export { createPost, updatePost };
