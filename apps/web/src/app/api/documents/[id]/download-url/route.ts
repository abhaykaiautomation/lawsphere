import { NextRequest } from 'next/server';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, forbidden, handleError } from '@/lib/errors';

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sub } = getCurrentUser(req);

    const document = await prisma.document.findUnique({
      where: { id, deletedAt: null },
      include: { clientProfile: true },
    });
    if (!document) return notFound('Document not found');
    if (document.clientProfile?.userId !== sub) return forbidden();

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: document.s3Bucket, Key: document.s3Key }),
      { expiresIn: 3600 },
    );
    return ok({ url });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sub } = getCurrentUser(req);

    const document = await prisma.document.findUnique({
      where: { id },
      include: { clientProfile: true },
    });
    if (!document) return notFound('Document not found');
    if (document.clientProfile?.userId !== sub) return forbidden();

    await s3.send(new DeleteObjectCommand({ Bucket: document.s3Bucket, Key: document.s3Key }));
    await prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });

    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
