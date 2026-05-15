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
      idToken: string;
      role?: UserRole;
      firstName?: string;
      lastName?: string;
    };

    const decoded = await adminAuth.verifyIdToken(idToken);
    const { uid, email = '', name: firebaseName = '' } = decoded;

    const isAdmin = adminEmails.includes(email.toLowerCase());

    // ── 1. Try find by Firebase UID (returning user) ─────────────────────────
    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

    // ── 2. Try find by email (existing seeded / imported account — link UID) ──
    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await prisma.user.update({
          where: { email },
          data: {
            firebaseUid: uid,
            emailVerified: true,
            ...(isAdmin && { role: UserRole.ADMIN, status: UserStatus.ACTIVE }),
          },
        });
      }
    }

    // ── 3. Promote existing user to admin if their email now matches ──────────
    if (user && isAdmin && user.role !== UserRole.ADMIN) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
      });
    }

    // ── 3b. Block lawyers who haven't been approved yet ──────────────────────
    if (user && user.role === UserRole.LAWYER) {
      if (user.status === 'PENDING_VERIFICATION') {
        return err('Your application is pending admin approval. You will receive login credentials once approved.', 403);
      }
      if (user.status === 'INACTIVE') {
        return err('Your lawyer account has been deactivated. Please contact support.', 403);
      }
      if (user.status === 'SUSPENDED') {
        return err('Your account has been suspended. Please contact support.', 403);
      }
    }

    // ── 4. New user — needs role selection unless admin ───────────────────────
    if (!user) {
      if (!requestedRole && !isAdmin) {
        // Tell the frontend: no account found, redirect to register
        return ok({ needsRegistration: true, email });
      }

      const effectiveRole: UserRole = isAdmin
        ? UserRole.ADMIN
        : (requestedRole ?? UserRole.CLIENT);

      const fullName = firebaseName || `${firstName || ''} ${lastName || ''}`;
      const [fn = '', ...rest] = fullName.trim().split(' ');
      const ln = rest.join(' ') || lastName || '';

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          role: effectiveRole,
          emailVerified: true,
          status: effectiveRole === UserRole.LAWYER
            ? UserStatus.PENDING_VERIFICATION
            : UserStatus.ACTIVE,
        },
      });

      // Create profile on first sign-up
      if (effectiveRole === UserRole.CLIENT) {
        await prisma.clientProfile.create({
          data: { userId: user.id, firstName: fn, lastName: ln },
        });
      } else if (effectiveRole === UserRole.LAWYER) {
        await prisma.lawyerProfile.create({
          data: {
            userId: user.id,
            firstName: fn,
            lastName: ln,
            slug: `${fn}-${ln}-${uuidv4().slice(0, 6)}`.toLowerCase().replace(/\s+/g, '-').replace(/^-|-$/g, ''),
            consultationFee: 0,
          },
        });
      } else if (effectiveRole === UserRole.ADMIN) {
        await prisma.adminProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id, firstName: fn, lastName: ln },
        });
      }
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
