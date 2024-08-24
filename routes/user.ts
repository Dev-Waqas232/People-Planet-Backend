import express from 'express';
import { login, register } from '../controllers/user';

const router = express.Router();

// @route POST /api/users/auth/register
// @desc Register a new user
// @access Public
router.post('/auth/register', register);

// @route POST /api/users/auth/login
// @desc Login User
// @access Public
router.post('/auth/login', login);

export default router;
