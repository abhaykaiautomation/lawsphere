import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    getCurrentUser(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) return err('Payment verification failed');

    const payment = await prisma.payment.findFirst({ where: { providerOrderId: razorpay_order_id } });
    if (!payment) return notFound('Payment record not found');

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', providerPaymentId: razorpay_payment_id, providerSignature: razorpay_signature },
    });

    await prisma.invoice.create({
      data: { paymentId: payment.id, invoiceNumber: `INV-${Date.now()}` },
    });

    return ok({ success: true, paymentId: payment.id });
  } catch (e) {
    return handleError(e);
  }
}
