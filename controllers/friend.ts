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

    const response = await Promise.all(
      user!.friendRequestsSent.map(async (id) => {
        const requestedFriend = await User.findById(id).select(
          'firstName lastName profilePicture'
        );
        return requestedFriend;
      })
    );

    res
      .status(200)
      .json({ message: 'Friend Request Sent', ok: true, data: response });
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
      (id) => id.toString() !== friendId
    );

    friend.friendRequestsSent = friend?.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    const response = await Promise.all(
      user!.friends.map(async (id) => {
        const requestedFriend = await User.findById(id).select(
          'firstName lastName profilePicture'
        );
        return requestedFriend;
      })
    );

    res
      .status(200)
      .json({ message: 'Friend Request Accepted', ok: true, data: response });
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

    res.status(200).json({
      message: 'Friend Request Cancelled',
      ok: true,
      data: { friendId },
    });
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

    user.friends = user.friends.filter((id) => id.toString() !== friendId);

    friend.friends = friend.friends.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    res
      .status(200)
      .json({ message: 'Removed Friend', ok: true, data: friendId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const suggestFriends = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const currentUser = await User.findById(userId).select(
      'friends friendRequestsReceived friendRequestsSent'
    );

    const excludeUserIds = [
      ...currentUser!.friends,
      ...currentUser!.friendRequestsReceived,
      ...currentUser!.friendRequestsSent,
      userId,
    ];

    const users = await User.find({ _id: { $nin: excludeUserIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName profilePicture _id');

    res
      .status(200)
      .json({ message: 'Fetched Suggestions', ok: true, data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

const fetchUserFriends = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', ok: false });
    }

    const friends = await Promise.all(
      user!.friends.map(async (id) => {
        const requestedFriend = await User.findById(id).select(
          'firstName lastName profilePicture'
        );
        return requestedFriend;
      })
    );

    const friendRequestsSent = await Promise.all(
      user.friendRequestsSent.map(async (id) => {
        const requestedFriend = await User.findById(id).select(
          'firstName lastName profilePicture'
        );
        return requestedFriend;
      })
    );

    const friendRequestsReceived = await Promise.all(
      user.friendRequestsReceived.map(async (id) => {
        const requestedFriend = await User.findById(id).select(
          'firstName lastName profilePicture'
        );
        return requestedFriend;
      })
    );

    res.status(200).json({
      message: 'Data Fetched',
      ok: true,
      data: {
        friends,
        friendRequestsSent,
        friendRequestsReceived,
      },
    });
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
  fetchUserFriends,
};
