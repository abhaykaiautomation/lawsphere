import { NextRequest } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return err('No file provided');
    if (file.size > MAX_FILE_SIZE) return err('File exceeds 10MB limit');
    if (!ALLOWED_TYPES.includes(file.type)) return err('File type not allowed');

    const caseId = formData.get('caseId') as string | undefined;
    const documentType = formData.get('documentType') as string | undefined;

    const bucket = process.env.S3_BUCKET_DOCUMENTS!;
    const s3Key = `documents/${sub}/${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(new PutObjectCommand({
      Bucket: bucket, Key: s3Key, Body: buffer,
      ContentType: file.type, ServerSideEncryption: 'AES256',
    }));

    const document = await prisma.document.create({
      data: {
        clientProfileId: clientProfile.id,
        caseId: caseId ?? undefined,
        type: (documentType as never) ?? 'LEGAL_DOCUMENT',
        status: 'PROCESSED',
        originalName: file.name,
        s3Key, s3Bucket: bucket,
        mimeType: file.type,
        sizeBytes: file.size,
        processedAt: new Date(),
      },
    });

    return ok(document, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId') ?? undefined;

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const documents = await prisma.document.findMany({
      where: { clientProfileId: clientProfile.id, deletedAt: null, ...(caseId && { caseId }) },
      orderBy: { uploadedAt: 'desc' },
    });
    return ok(documents);
  } catch (e) {
    return handleError(e);
  }
}
