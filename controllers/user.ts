import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/user';
import { generateToken } from '../utils/jwt';

const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dob, email, password } = req.body;

    const userExists = await User.findOne({ email: email });
    if (userExists)
      return res
        .status(409)
        .json({ message: 'Email already exists', ok: false });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName,
      lastName,
      dob: new Date(dob),
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: 'User Created Successfully', data: user, ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(401)
        .json({ message: 'Invalid Credentials', ok: false });

    const matchPass = await bcrypt.compare(password, user.password);
    if (!matchPass)
      return res
        .status(401)
        .json({ message: 'Invalid Credentials', ok: false });

    const token = generateToken(user._id.toString());
    res
      .status(200)
      .json({ message: 'Login Successfully', ok: true, data: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const getUserData = async (req: Request, res: Response) => {
  console.log(req.userId);
};

export { register, login, getUserData };
