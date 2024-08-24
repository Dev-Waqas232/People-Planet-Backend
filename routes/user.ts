import express from 'express';
import { getUserData, login, register } from '../controllers/user';
import { authorize } from '../middlewares';

const router = express.Router();

// @route POST /api/users/auth/register
// @desc Register a new user
// @access Public
router.post('/auth/register', register);

// @route POST /api/users/auth/login
// @desc Login User
// @access Public
router.post('/auth/login', login);

// @route GET /api/users/:profileId
// @desc Get User Profile
// @access Private
router.get('/:profileId', authorize, getUserData);

export default router;
