import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sub } = getCurrentUser(req);
    await prisma.notification.updateMany({
      where: { id, userId: sub },
      data: { isRead: true, readAt: new Date() },
    });
    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
