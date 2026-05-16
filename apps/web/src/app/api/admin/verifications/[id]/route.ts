import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';
import { getCurrentUser } from '@/lib/auth';
import { sendLawyerApprovalEmail } from '@/lib/email';
import { ok, notFound, forbidden, handleError } from '@/lib/errors';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd + '@1';
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
    let firebaseUid: string;

    try {
      const existing = await adminAuth.getUserByEmail(lawyer.user.email).catch(() => null);
      if (existing) {
        // Set a temp password so Firebase generates a valid reset link
        await adminAuth.updateUser(existing.uid, { password: generateTempPassword(), emailVerified: true });
        firebaseUid = existing.uid;
      } else {
        const fbUser = await adminAuth.createUser({
          email: lawyer.user.email,
          password: generateTempPassword(),
          displayName: `${lawyer.firstName} ${lawyer.lastName}`,
          emailVerified: true,
        });
        firebaseUid = fbUser.uid;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Firebase error';
      return ok({ success: false, error: `Firebase account creation failed: ${msg}` }, 500);
    }

    // Clear conflicting firebaseUid from another user (e.g. same person had a client Google account)
    const conflict = await prisma.user.findFirst({ where: { firebaseUid, NOT: { id: lawyer.userId } } });
    if (conflict) await prisma.user.update({ where: { id: conflict.id }, data: { firebaseUid: null } });

    // Update DB
    await prisma.lawyerProfile.update({
      where: { id },
      data: { verificationStatus: 'VERIFIED', availabilityStatus: 'AVAILABLE', isProfileComplete: true },
    });
    await prisma.user.update({
      where: { id: lawyer.userId },
      data: { status: 'ACTIVE', firebaseUid, emailVerified: true },
    });

    // Generate Firebase password reset link (lawyer sets their own password)
    const loginUrl   = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/login`;
    const resetLink  = await adminAuth.generatePasswordResetLink(lawyer.user.email, { url: loginUrl })
                         .catch(() => null);

    // Send approval email with reset link
    const lawyerName = `Adv. ${lawyer.firstName} ${lawyer.lastName}`;
    let emailSent = false;
    if (resetLink) {
      const result = await sendLawyerApprovalEmail({
        to:         lawyer.user.email,
        lawyerName,
        resetLink,
        loginUrl,
      }).catch(() => ({ sent: false }));
      emailSent = result.sent;
    }

    // In-app notification
    await prisma.notification.create({
      data: {
        userId: lawyer.userId,
        type: 'LAWYER_VERIFIED',
        title: 'Profile Verified! You can now receive clients.',
        body: emailSent
          ? 'Your account has been verified. Check your email for a link to set up your password.'
          : 'Your account has been verified. Contact admin for login credentials.',
      },
    });

    return ok({
      success: true,
      status:  'VERIFIED',
      emailSent,
      resetLink: resetLink ?? null,
      credentials: {
        email:    lawyer.user.email,
        loginUrl,
        note: emailSent
          ? `Approval email sent to ${lawyer.user.email} with a password setup link.`
          : `SMTP not configured. Reset link: ${resetLink ?? 'unavailable'}`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
