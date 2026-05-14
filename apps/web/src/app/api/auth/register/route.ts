import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, err, conflict, handleError } from '@/lib/errors';
import { UserRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, firstName, lastName } = await req.json() as {
      email: string; password: string; role: UserRole; firstName?: string; lastName?: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return conflict('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email, role,
          // Clients are active immediately; lawyers need admin approval
          status: role === UserRole.CLIENT ? 'ACTIVE' : 'PENDING_VERIFICATION',
        },
      });

      if (role === UserRole.CLIENT) {
        await tx.clientProfile.create({
          data: { userId: newUser.id, firstName: firstName ?? '', lastName: lastName ?? '' },
        });
      } else if (role === UserRole.LAWYER) {
        const slug = `${firstName ?? ''}-${lastName ?? ''}-${uuidv4().slice(0, 6)}`.toLowerCase().replace(/\s+/g, '-');
        await tx.lawyerProfile.create({
          data: { userId: newUser.id, firstName: firstName ?? '', lastName: lastName ?? '', slug, consultationFee: 0 },
        });
      }

      await tx.userSession.create({
        data: { userId: newUser.id, token: `pwd:${passwordHash}`, expiresAt: new Date('2099-12-31') },
      });

      return newUser;
    });

    const token = signToken(user.id, user.email, user.role);
    return ok({ user: { id: user.id, email: user.email, role: user.role, status: user.status }, token }, 201);
  } catch (e) {
    return handleError(e);
  }
}
