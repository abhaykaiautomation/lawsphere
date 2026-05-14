import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);
    const skip = (page - 1) * limit;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: sub },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId: sub, isRead: false } }),
    ]);
    return ok({ notifications, unreadCount, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
