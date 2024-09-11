import express from 'express';
import {
  getUser,
  login,
  register,
  requestReset,
  resetPassword,
  updateUser,
} from '../controllers/user';
import { authorize } from '../middlewares';
import { upload } from '../middlewares/upload';

const router = express.Router();

// @route POST /api/users/auth/register
// @desc Register a new user
// @access Public
router.post('/auth/register', register);

// @route POST /api/users/auth/login
// @desc Login User
// @access Public
router.post('/auth/login', login);

// @route POST /api/users/auth/request-reset
// @desc Request Password Reset
// @access Public
router.post('/auth/request-reset', requestReset);

// @route POST /api/users/auth/reset-password
// @desc Reset Password
// @access Private
router.post('/auth/reset-password', resetPassword);

// @route GET /api/users/:profileId
// @desc Get User Profile
// @access Private
router.get('/:profileId', authorize, getUser);

// @route PUT /api/users/:profileId
// @desc Get User Profile
// @access Private
router.put('/:profileId', authorize, upload.single('image'), updateUser);

export default router;
