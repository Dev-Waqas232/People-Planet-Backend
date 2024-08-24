import express from 'express';
import { register } from '../controllers/user';

const router = express.Router();

// @route POST /api/users/auth/register
// @desc Register a new user
// @access Public
router.post('/auth/register', register);

export default router;
