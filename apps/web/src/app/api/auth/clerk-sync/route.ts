import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';
import { UserRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { clerkId, email, role, firstName, lastName } = await req.json() as {
      clerkId: string; email: string; role: UserRole; firstName?: string; lastName?: string;
    };

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email },
      create: { clerkId, email, role, emailVerified: true, status: 'ACTIVE' },
    });

    if (role === UserRole.CLIENT) {
      await prisma.clientProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, firstName: firstName ?? '', lastName: lastName ?? '' },
      });
    } else if (role === UserRole.LAWYER) {
      await prisma.lawyerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          slug: `${firstName ?? ''}-${lastName ?? ''}-${uuidv4().slice(0, 6)}`.toLowerCase().replace(/\s+/g, '-'),
          consultationFee: 0,
        },
      });
    }

    const token = signToken(user.id, user.email, user.role);
    return ok({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (e) {
    return handleError(e);
  }
}
