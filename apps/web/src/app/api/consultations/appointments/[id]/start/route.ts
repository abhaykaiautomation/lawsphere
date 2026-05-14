import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sub } = getCurrentUser(req);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { consultation: true },
    });
    if (!appointment) return notFound('Appointment not found');
    if (appointment.status !== 'CONFIRMED') return err('Appointment is not confirmed');

    if (appointment.consultation) {
      return ok(await generateRoomToken(appointment.consultation, sub));
    }

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: id,
        caseId: appointment.caseId,
        lawyerProfileId: appointment.lawyerProfileId,
        roomId: `room-${uuidv4()}`,
        mode: appointment.mode,
        status: 'SCHEDULED',
      },
    });

    return ok(await generateRoomToken(consultation, sub));
  } catch (e) {
    return handleError(e);
  }
}

async function generateRoomToken(consultation: { roomId: string; id: string }, userId: string) {
  let token: string | null = null;

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET) {
    try {
      const Twilio = await import('twilio');
      const AccessToken = Twilio.jwt.AccessToken;
      const VideoGrant = AccessToken.VideoGrant;
      const accessToken = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        { identity: userId, ttl: 3600 },
      );
      accessToken.addGrant(new VideoGrant({ room: consultation.roomId }));
      token = accessToken.toJwt();
    } catch {
      // Fall through to mock token
    }
  }

  return { roomId: consultation.roomId, token: token ?? `mock-token-${uuidv4()}`, consultationId: consultation.id };
}
