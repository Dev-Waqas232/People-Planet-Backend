import { Request, Response } from 'express';

import Post from '../models/post';
import Comment from '../models/comment';

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

export { createPost };
