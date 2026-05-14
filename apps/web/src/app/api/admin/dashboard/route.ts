import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, forbidden, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { role } = getCurrentUser(req);
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return forbidden();

    const [totalUsers, totalLawyers, totalCases, totalRevenue, pendingVerifications] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.lawyerProfile.count({ where: { deletedAt: null } }),
      prisma.case.count({ where: { deletedAt: null } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.lawyerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    ]);

    return ok({ totalUsers, totalLawyers, totalCases, totalRevenue: totalRevenue._sum.amount ?? 0, pendingVerifications });
  } catch (e) {
    return handleError(e);
  }
}
