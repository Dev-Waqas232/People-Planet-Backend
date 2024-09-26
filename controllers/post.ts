import { Request, Response } from 'express';

import Post from '../models/post';
import Comment from '../models/comment';
import mongoose from 'mongoose';
import User from '../models/user';

const createPost = async (req: Request, res: Response) => {
  const { content } = req.body;
  const { userId } = req;
  const image = req.file ? req.file.filename : null;

  try {
    const post = await Post.create({ content, image, createdBy: userId });
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

const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(postId))
      return res.status(404).json({ message: 'Post not found', ok: false });

    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found', ok: false });
    }

    res
      .status(200)
      .json({ message: 'Post deleted Successfully', ok: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};
const getPosts = async (req: Request, res: Response) => {
  const currentUserId = req.userId;

  try {
    const currentUser = await User.findById(currentUserId).select('friends');
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found', ok: false });
    }

    const friendsList = currentUser.friends;
    if (friendsList.length === 0) {
      return res
        .status(200)
        .json({
          message: 'No posts found. You have no friends yet!',
          ok: true,
          data: [],
        });
    }

    const posts = await Post.find({ createdBy: { $in: friendsList } })
      .populate('createdBy', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Posts Fetched', ok: true, data: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

export { createPost, updatePost, deletePost, getPosts };
