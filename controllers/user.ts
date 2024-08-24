import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/user';

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

export { register };
