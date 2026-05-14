import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, forbidden, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { role } = getCurrentUser(req);
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return forbidden();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);
    const roleFilter = searchParams.get('role') ?? undefined;
    const skip = (page - 1) * limit;

    const where = { deletedAt: null, ...(roleFilter && { role: roleFilter as never }) };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, status: true, createdAt: true,
          clientProfile: { select: { firstName: true, lastName: true } },
          lawyerProfile: { select: { firstName: true, lastName: true, verificationStatus: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return ok({ users, total, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
