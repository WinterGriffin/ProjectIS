import jwt from 'jsonwebtoken';

export function verifyAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}