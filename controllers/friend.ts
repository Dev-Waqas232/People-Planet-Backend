import { Request, Response } from 'express';
import User from '../models/user';

const sendFriendRequest = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (
      user?.friends.includes(friendId) ||
      user?.friendRequestsSent.includes(friendId)
    ) {
      return res
        .status(400)
        .json({ message: 'Request already sent', ok: false });
    }

    user?.friendRequestsSent.push(friendId);
    friend?.friendRequestsReceived.push(user!._id);

    await user?.save();
    await friend?.save();

    res
      .status(200)
      .json({ message: 'Friend Request Sent', ok: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const acceptFriendRequest = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend)
      return res.status(404).json({ message: 'Friend not found', ok: false });

    if (!user?.friendRequestsReceived.includes(friendId))
      return res.status(404).json({ message: 'Request not found', ok: false });

    user.friends.push(friendId);
    friend?.friends.push(user._id);

    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString !== friendId
    );

    friend.friendRequestsSent = friend?.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    res
      .status(200)
      .json({ message: 'Friend Request Accepted', ok: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const cancelFriendRequest = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { friendId } = req.body;
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend || !user)
      return res.status(404).json({ message: 'Friend not found', ok: false });

    user.friendRequestsReceived = user?.friendRequestsReceived.filter(
      (id) => id.toString() !== friendId.toString()
    );

    friend.friendRequestsSent = friend.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    res
      .status(200)
      .json({ message: 'Friend Request Cancelled', ok: false, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const removeFriend = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend || !user)
      return res.status(404).json({ message: 'Friend not found', ok: false });

    user.friends = user.friends.filter(
      (id) => id.toString !== friendId.toString()
    );

    friend.friends = friend.friends.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Removed Friend', ok: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const suggestFriends = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const users = await User.find({ _id: { $ne: userId } })
      .sort({ createdAt: -1 })
      .limit(10);

    res
      .status(200)
      .json({ message: 'Fetched Suggestions', ok: true, data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

export {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  removeFriend,
  suggestFriends,
};
