// Load .env.local manually (no dotenv dependency needed)
const fs   = require('fs');
const path = require('path');
const envFile = path.resolve(process.cwd(), '.env.local');
fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth }                       = require('firebase-admin/auth');
const { PrismaClient }                  = require('@prisma/client');

if (getApps().length === 0) {
  initializeApp({ credential: cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  })});
}

const adminAuth = getAuth();
const prisma    = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAILS || '').split(',')[0].trim();

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + '@1';
}

async function main() {
  if (!ADMIN_EMAIL) { console.error('ADMIN_EMAILS not set'); process.exit(1); }

  const PASS = genPassword();
  console.log('\nCreating admin account for:', ADMIN_EMAIL, '\n');

  let uid;
  const existing = await adminAuth.getUserByEmail(ADMIN_EMAIL).catch(() => null);
  if (existing) {
    await adminAuth.updateUser(existing.uid, { password: PASS, emailVerified: true });
    uid = existing.uid;
    console.log('Updated existing Firebase user');
  } else {
    const fb = await adminAuth.createUser({
      email: ADMIN_EMAIL, password: PASS,
      emailVerified: true, displayName: 'LawSphere Admin',
    });
    uid = fb.uid;
    console.log('Created Firebase user:', uid);
  }

  const user = await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: { firebaseUid: uid, role: 'ADMIN', status: 'ACTIVE', emailVerified: true },
    create: { email: ADMIN_EMAIL, firebaseUid: uid, role: 'ADMIN', status: 'ACTIVE', emailVerified: true },
  });

  await prisma.adminProfile.upsert({
    where:  { userId: user.id },
    update: {},
    create: { userId: user.id, firstName: 'LawSphere', lastName: 'Admin' },
  });

  console.log('DB record ready\n');
  console.log('='.repeat(52));
  console.log('  ADMIN CREDENTIALS');
  console.log('='.repeat(52));
  console.log('  Email    :', ADMIN_EMAIL);
  console.log('  Password :', PASS);
  console.log('  Login    : http://localhost:3000/login');
  console.log('             Select "Admin" tab → enter email + password');
  console.log('='.repeat(52));
  console.log('\n  Save this password — it will not be shown again.\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
