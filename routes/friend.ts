import express from 'express';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  removeFriend,
  sendFriendRequest,
  suggestFriends,
} from '../controllers/friend';
import { authorize } from '../middlewares';

const router = express.Router();

router.post('/send-request', authorize, sendFriendRequest);

router.post('/accept-request', authorize, acceptFriendRequest);

router.post('/cancel-request', authorize, cancelFriendRequest);

router.post('/remove-friend', authorize, removeFriend);

router.get('/', authorize, suggestFriends);

export default router;
