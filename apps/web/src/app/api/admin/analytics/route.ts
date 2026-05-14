import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, forbidden, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { role } = getCurrentUser(req);
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return forbidden();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newUsersThisMonth, consultationsThisMonth, revenueThisMonth, topPracticeAreas] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.consultation.count({ where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true, platformFee: true } }),
      prisma.lawyerPracticeArea.groupBy({ by: ['practiceAreaId'], _count: { practiceAreaId: true }, orderBy: { _count: { practiceAreaId: 'desc' } }, take: 5 }),
    ]);

    return ok({
      newUsersThisMonth,
      consultationsThisMonth,
      revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
      platformFeeThisMonth: revenueThisMonth._sum.platformFee ?? 0,
      topPracticeAreas,
    });
  } catch (e) {
    return handleError(e);
  }
}
