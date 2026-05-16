import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, handleError } from '@/lib/errors';
import { v4 as uuidv4 } from 'uuid';

// POST — send a message (finds or creates the consultation/thread first)
export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { appointmentId, content } = await req.json() as { appointmentId: string; content: string };

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { clientProfile: true, lawyerProfile: true },
    });
    if (!appointment) return notFound('Appointment not found');

    // Auto-create a consultation for this appointment if one doesn't exist yet
    let consultation = await prisma.consultation.findUnique({ where: { appointmentId } });
    if (!consultation) {
      consultation = await prisma.consultation.create({
        data: {
          appointmentId,
          lawyerProfileId: appointment.lawyerProfileId,
          caseId: appointment.caseId ?? undefined,
          roomId: `chat-${uuidv4().slice(0, 8)}`,
          mode: appointment.mode,
          status: 'SCHEDULED',
        },
      });
    }

    const message = await prisma.message.create({
      data: { consultationId: consultation.id, senderId: sub, content, type: 'TEXT' },
      include: { sender: { select: { id: true, role: true } } },
    });

    return ok(message, 201);
  } catch (e) {
    return handleError(e);
  }
}
