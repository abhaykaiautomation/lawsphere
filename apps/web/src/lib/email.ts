import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendLawyerApprovalEmail(opts: {
  to:           string;
  lawyerName:   string;
  resetLink:    string;
  loginUrl:     string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) {
    console.warn('[email] SMTP not configured — skipping email send');
    return { sent: false };
  }

  const from = process.env.EMAIL_FROM ?? 'LawSphere <noreply@lawsphere.in>';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#4f46e5;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">⚖ LawSphere</h1>
          <p style="margin:6px 0 0;color:#c7d2fe;font-size:14px;">AI-Powered Legal Marketplace</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">
          <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">
            Congratulations, ${opts.lawyerName}!
          </h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
            Your LawSphere lawyer profile has been <strong style="color:#059669;">verified and approved</strong>.
            You can now start receiving clients and accepting consultations on the platform.
          </p>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 28px;">
            <p style="margin:0 0 6px;color:#15803d;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Next Step</p>
            <p style="margin:0;color:#166534;font-size:14px;line-height:1.5;">
              Set up your password to activate your lawyer account. The link below expires in <strong>24 hours</strong>.
            </p>
          </div>

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td align="center">
              <a href="${opts.resetLink}"
                 style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
                Set Up My Password →
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">After setting your password, sign in at:</p>
          <a href="${opts.loginUrl}" style="color:#4f46e5;font-size:13px;word-break:break-all;">${opts.loginUrl}</a>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">
            On the login page, select the <strong>Lawyer</strong> tab and use your registered email.
          </p>
        </td></tr>
        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            If you did not apply to LawSphere, please ignore this email.<br>
            © ${new Date().getFullYear()} LawSphere Technologies. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const transporter = createTransport();
  await transporter.sendMail({
    from,
    to:      opts.to,
    subject: '🎉 Your LawSphere lawyer account is approved — set up your password',
    html,
    text: `Hi ${opts.lawyerName},\n\nYour LawSphere lawyer profile has been approved!\n\nSet up your password here: ${opts.resetLink}\n\nAfter that, sign in at: ${opts.loginUrl} (select the Lawyer tab)\n\nThis link expires in 24 hours.\n\n— LawSphere Team`,
  });

  return { sent: true };
}
