import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';
import { UserRole, UserStatus } from '@prisma/client';

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const { idToken, role: requestedRole, firstName, lastName } = await req.json() as {
      idToken: string; role: UserRole; firstName?: string; lastName?: string;
    };

    const decoded = await adminAuth.verifyIdToken(idToken);
    const { uid, email = '' } = decoded;

    // Admin emails are auto-promoted regardless of requested role
    const isAdmin = adminEmails.includes(email.toLowerCase());
    const effectiveRole: UserRole = isAdmin ? UserRole.ADMIN : requestedRole;

    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      // On re-login: promote to admin if email matches, otherwise keep existing role/status
      update: {
        email,
        ...(isAdmin && { role: UserRole.ADMIN, status: UserStatus.ACTIVE }),
      },
      create: {
        firebaseUid: uid,
        email,
        role: effectiveRole,
        emailVerified: true,
        // Lawyers need admin approval before they can access the platform
        status: effectiveRole === UserRole.LAWYER
          ? UserStatus.PENDING_VERIFICATION
          : UserStatus.ACTIVE,
      },
    });

    // Create profiles on first sign-up only
    if (effectiveRole === UserRole.CLIENT) {
      await prisma.clientProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, firstName: firstName ?? '', lastName: lastName ?? '' },
      });
    } else if (effectiveRole === UserRole.LAWYER) {
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
    return ok({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
      token,
    });
  } catch (e) {
    return handleError(e);
  }
}
