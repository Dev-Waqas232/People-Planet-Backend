import express from 'express';
import { upload } from '../middlewares/upload';
import { createPost, getPosts } from '../controllers/post';
import { authorize } from '../middlewares';

const router = express.Router();

router.post('/', authorize, upload.single('image'), createPost);

router.get('/', authorize, getPosts);

export default router;
