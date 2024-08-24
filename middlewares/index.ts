import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;

    if (!authorization && authorization?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Unauthorized', ok: false });

    const token = authorization?.split(' ')[1];

    if (!token)
      return res.status(401).json({ message: 'Unauthorized', ok: false });

    const id = verifyToken(token);
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized', ok: false });
    }
    req.userId = id;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', ok: false });
  }
};

export { authorize };
