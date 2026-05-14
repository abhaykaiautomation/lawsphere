import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, handleError } from '@/lib/errors';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    getCurrentUser(req);

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: { appointment: true },
    });
    if (!consultation) return notFound('Consultation not found');

    const now = new Date();
    const startedAt = consultation.startedAt ?? consultation.appointment.scheduledAt;
    const actualDurationMin = Math.round((now.getTime() - startedAt.getTime()) / 60000);

    const updated = await prisma.consultation.update({
      where: { id },
      data: { status: 'COMPLETED', endedAt: now, actualDurationMin },
    });
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
