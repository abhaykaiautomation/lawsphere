import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sub } = getCurrentUser(req);

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const appointment = await prisma.appointment.findFirst({
      where: { id, clientProfileId: clientProfile.id },
      include: { lawyerProfile: true, payment: true },
    });
    if (!appointment) return notFound('Appointment not found');
    if (appointment.payment) return err('Payment already initiated');
    if (appointment.status !== 'CONFIRMED') return err('Appointment must be confirmed before payment');

    const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT ?? 10);
    const amount = Number(appointment.lawyerProfile.consultationFee);
    const platformFee = (amount * platformFeePercent) / 100;
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: appointment.lawyerProfile.currency,
      receipt: id,
    });

    const payment = await prisma.payment.create({
      data: {
        appointmentId: id,
        clientId: clientProfile.userId,
        lawyerProfileId: appointment.lawyerProfileId,
        amount,
        currency: appointment.lawyerProfile.currency,
        platformFee,
        lawyerPayout: amount - platformFee,
        status: 'PENDING',
        provider: 'RAZORPAY',
        providerOrderId: order.id,
      },
    });

    return ok({ orderId: order.id, amount: amountInPaise, currency: appointment.lawyerProfile.currency, paymentId: payment.id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    return handleError(e);
  }
}
