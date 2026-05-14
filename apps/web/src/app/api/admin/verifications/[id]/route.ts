import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, forbidden, handleError } from '@/lib/errors';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd + '@1';  // satisfies most password rules
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { role } = getCurrentUser(req);
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return forbidden();

    const { status, reason } = await req.json() as { status: 'VERIFIED' | 'REJECTED'; reason?: string };

    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!lawyer) return notFound('Lawyer not found');

    if (status === 'REJECTED') {
      await prisma.lawyerProfile.update({ where: { id }, data: { verificationStatus: 'REJECTED' } });
      await prisma.user.update({ where: { id: lawyer.userId }, data: { status: 'INACTIVE' } });
      await prisma.notification.create({
        data: {
          userId: lawyer.userId,
          type: 'LAWYER_VERIFIED',
          title: 'Verification Rejected',
          body: `Your verification was rejected. ${reason ?? 'Please contact support for details.'}`,
        },
      });
      return ok({ success: true, status: 'REJECTED' });
    }

    // ── APPROVED: create Firebase account ────────────────────────────────────
    const tempPassword = generateTempPassword();
    let firebaseUid: string;

    try {
      // Check if Firebase user already exists (re-approval case)
      const existing = await adminAuth.getUserByEmail(lawyer.user.email).catch(() => null);
      if (existing) {
        firebaseUid = existing.uid;
        await adminAuth.updateUser(existing.uid, { password: tempPassword });
      } else {
        const fbUser = await adminAuth.createUser({
          email: lawyer.user.email,
          password: tempPassword,
          displayName: `${lawyer.firstName} ${lawyer.lastName}`,
          emailVerified: true,
        });
        firebaseUid = fbUser.uid;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Firebase error';
      return ok({ success: false, error: `Firebase account creation failed: ${msg}` }, 500);
    }

    await prisma.lawyerProfile.update({ where: { id }, data: { verificationStatus: 'VERIFIED', availabilityStatus: 'AVAILABLE', isProfileComplete: true } });
    await prisma.user.update({
      where: { id: lawyer.userId },
      data: { status: 'ACTIVE', firebaseUid, emailVerified: true },
    });

    await prisma.notification.create({
      data: {
        userId: lawyer.userId,
        type: 'LAWYER_VERIFIED',
        title: 'Profile Verified! You can now receive clients.',
        body: 'Your LawSphere lawyer account has been verified. Login credentials have been shared with you.',
      },
    });

    return ok({
      success: true,
      status: 'VERIFIED',
      credentials: {
        email: lawyer.user.email,
        tempPassword,
        loginUrl: `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/login`,
        note: 'Share these credentials with the lawyer. They should change their password after first login.',
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
