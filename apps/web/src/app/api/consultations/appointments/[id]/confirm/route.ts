import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { sub } = getCurrentUser(req);
    const lawyer = await prisma.lawyerProfile.findUnique({ where: { userId: sub } });
    if (!lawyer) return notFound('Lawyer not found');

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, lawyerProfileId: lawyer.id },
    });
    if (!appointment) return notFound('Appointment not found');
    if (appointment.status !== 'PENDING') return err(`Cannot confirm appointment in ${appointment.status} status`);

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'CONFIRMED' },
    });
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
