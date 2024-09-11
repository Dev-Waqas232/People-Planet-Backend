import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/user';
import { generateToken } from '../utils/jwt';
import { sendResetEmail } from '../utils/nodeMailer';

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
        .status(404)
        .json({ message: 'Invalid Credentials', ok: false });

    const matchPass = await bcrypt.compare(password, user.password);
    if (!matchPass)
      return res
        .status(404)
        .json({ message: 'Invalid Credentials', ok: false });

    const token = generateToken(user._id.toString());
    res
      .status(200)
      .json({ message: 'Login Successfully', ok: true, data: { token, user } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const getUser = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  try {
    const user = await User.findById(profileId).select('-password');
    if (!user)
      return res
        .status(404)
        .json({ message: "Profile Doesn't Exist", ok: false });

    res
      .status(200)
      .json({ message: 'Data Fetched Successfully', ok: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const image = req.file ? req.file.filename : null;

  try {
    const user = await User.findById(profileId);
    if (!user)
      return res
        .status(404)
        .json({ message: "Profile Doesn't Exists", ok: false });

    const { firstName, lastName, dob, email } = req.body;

    const checkEmail = await User.findOne({ email, _id: { $ne: profileId } });
    if (checkEmail)
      return res
        .status(409)
        .json({ message: 'Email already exists', ok: false });

    const updatedUser = await User.findByIdAndUpdate(
      profileId,
      { firstName, lastName, dob, email, profilePicture: image },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profile Updated Successfully',
      ok: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const token = generateToken(email);
    const resetTokenExpiry = Date.now() + 3600000;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "Email doesn't exists", ok: false });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(resetTokenExpiry);

    await user.save();
    await sendResetEmail(user.email, token);
    res.status(200).json({ message: 'Password reset email sent', ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Can't reset password. Please try again", ok: false });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // TODO Invalid jwt token
    res
      .status(201)
      .json({ message: 'Password updated successfully', ok: true });

    await user.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

export { register, login, getUser, updateUser, requestReset, resetPassword };
