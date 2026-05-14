import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { sub } = getCurrentUser(req);
    await prisma.notification.updateMany({
      where: { id: params.id, userId: sub },
      data: { isRead: true, readAt: new Date() },
    });
    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
