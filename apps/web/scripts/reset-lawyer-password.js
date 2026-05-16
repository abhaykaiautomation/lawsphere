const fs   = require('fs');
const path = require('path');
fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth }                       = require('firebase-admin/auth');

if (getApps().length === 0) {
  initializeApp({ credential: cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  })});
}

const adminAuth = getAuth();
const EMAIL     = process.argv[2];

if (!EMAIL) {
  console.error('Usage: node scripts/reset-lawyer-password.js <email>');
  process.exit(1);
}

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + '@1';
}

async function main() {
  const pwd      = genPassword();
  const existing = await adminAuth.getUserByEmail(EMAIL).catch(() => null);

  if (!existing) {
    const fb = await adminAuth.createUser({ email: EMAIL, password: pwd, emailVerified: true });
    console.log('Created Firebase user:', fb.uid);
  } else {
    await adminAuth.updateUser(existing.uid, { password: pwd });
    console.log('Updated Firebase user:', existing.uid);
  }

  console.log('');
  console.log('='.repeat(52));
  console.log('  LAWYER CREDENTIALS');
  console.log('='.repeat(52));
  console.log('  Email    :', EMAIL);
  console.log('  Password :', pwd);
  console.log('  Login at : http://localhost:3000/login  (Lawyer tab)');
  console.log('='.repeat(52));
}

main().catch(e => { console.error(e.message); process.exit(1); });
