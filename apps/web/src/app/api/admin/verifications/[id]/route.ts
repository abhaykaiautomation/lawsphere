import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, forbidden, handleError } from '@/lib/errors';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getCurrentUser(req);
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return forbidden();

    const { status, reason } = await req.json() as { status: 'VERIFIED' | 'REJECTED'; reason?: string };

    const lawyer = await prisma.lawyerProfile.findUnique({ where: { id: params.id }, include: { user: true } });
    if (!lawyer) return notFound('Lawyer not found');

    await prisma.lawyerProfile.update({ where: { id: params.id }, data: { verificationStatus: status } });
    await prisma.user.update({ where: { id: lawyer.userId }, data: { status: status === 'VERIFIED' ? 'ACTIVE' : 'INACTIVE' } });

    await prisma.notification.create({
      data: {
        userId: lawyer.userId,
        type: 'LAWYER_VERIFIED',
        title: status === 'VERIFIED' ? 'Profile Verified!' : 'Verification Rejected',
        body: status === 'VERIFIED'
          ? 'Your lawyer profile has been verified. You can now receive clients.'
          : `Your verification was rejected. ${reason ?? ''}`,
      },
    });

    return ok({ success: true, status });
  } catch (e) {
    return handleError(e);
  }
}
