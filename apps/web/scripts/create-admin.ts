/**
 * One-time script: creates the admin Firebase account and DB record.
 * Run from: apps/web/  →  npx ts-node --project tsconfig.json scripts/create-admin.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { PrismaClient } from '@prisma/client';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const prisma    = new PrismaClient();

const ADMIN_EMAIL    = (process.env.ADMIN_EMAILS ?? '').split(',')[0].trim();
const TEMP_PASSWORD  = generatePassword();

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + '@1';
}

async function main() {
  if (!ADMIN_EMAIL) {
    console.error('❌ ADMIN_EMAILS not set in .env.local');
    process.exit(1);
  }

  console.log(`\n🔧 Creating admin Firebase account for: ${ADMIN_EMAIL}\n`);

  // 1. Create or update Firebase user
  let firebaseUid: string;
  try {
    const existing = await adminAuth.getUserByEmail(ADMIN_EMAIL).catch(() => null);
    if (existing) {
      await adminAuth.updateUser(existing.uid, { password: TEMP_PASSWORD, emailVerified: true });
      firebaseUid = existing.uid;
      console.log('✓ Updated existing Firebase user');
    } else {
      const fb = await adminAuth.createUser({
        email: ADMIN_EMAIL,
        password: TEMP_PASSWORD,
        emailVerified: true,
        displayName: 'LawSphere Admin',
      });
      firebaseUid = fb.uid;
      console.log('✓ Created Firebase user');
    }
  } catch (e) {
    console.error('❌ Firebase error:', e);
    process.exit(1);
  }

  // 2. Create or update DB user
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { firebaseUid, role: 'ADMIN', status: 'ACTIVE', emailVerified: true },
    create: {
      email: ADMIN_EMAIL,
      firebaseUid,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, firstName: 'LawSphere', lastName: 'Admin' },
  });

  console.log('✓ DB user record created/updated\n');
  console.log('═'.repeat(50));
  console.log('  ADMIN CREDENTIALS');
  console.log('═'.repeat(50));
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${TEMP_PASSWORD}`);
  console.log(`  Login at : http://localhost:3000/login  (select Admin)`);
  console.log('═'.repeat(50));
  console.log('\n⚠  Save this password. It won\'t be shown again.\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
