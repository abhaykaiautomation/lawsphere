import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, err, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    const user = await prisma.user.findUnique({
      where: { email },
      include: { sessions: { where: { token: { startsWith: 'pwd:' } }, take: 1 } },
    });

    if (!user) return err('Invalid credentials', 401);
    if (user.status === 'SUSPENDED') return err('Account suspended', 401);

    const pwdSession = user.sessions[0];
    if (!pwdSession) return err('Use social login for this account', 400);

    const isValid = await bcrypt.compare(password, pwdSession.token.replace('pwd:', ''));
    if (!isValid) return err('Invalid credentials', 401);

    const token = signToken(user.id, user.email, user.role);
    return ok({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (e) {
    return handleError(e);
  }
}
