import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
  return token;
};

const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;
    return decoded.id;
  } catch (error) {
    console.error('Token Verification Failed');
    return null;
  }
};

export { generateToken, verifyToken };
