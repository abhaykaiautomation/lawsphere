import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signToken(userId: string, email: string, role: UserRole): string {
  return jwt.sign({ sub: userId, email, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

export function getCurrentUser(req: NextRequest): JwtPayload {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = auth.slice(7);
  try {
    return verifyToken(token);
  } catch {
    throw new Error('Unauthorized');
  }
}
