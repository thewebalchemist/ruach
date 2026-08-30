// lib/email.ts
// Zoho SMTP transactional email helper
// Uses nodemailer — run: npm install nodemailer @types/nodemailer

import nodemailer from 'nodemailer';

// ── Transports (one per sender address) ──────────────────────────────────────
function createTransport(fromEmail: string, password: string) {
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.ZOHO_SMTP_PORT) || 587,
    secure: false,           // STARTTLS on port 587
    auth: { user: fromEmail, pass: password },
    tls: { rejectUnauthorized: true },
  });
}

const connectTransport = () =>
  createTransport(
    process.env.CONNECT_EMAIL_FROM!,
    process.env.CONNECT_EMAIL_PASSWORD!
  );

const discipleshipTransport = () =>
  createTransport(
    process.env.DISCIPLESHIP_EMAIL_FROM!,
    process.env.DISCIPLESHIP_EMAIL_PASSWORD!
  );

// ── Base send helper ──────────────────────────────────────────────────────────
async function send(
  transport: nodemailer.Transporter,
  from: string,
  to: string,
  subject: string,
  html: string
) {
  await transport.sendMail({ from: `"RuachConnect" <${from}>`, to, subject, html });
}

// ── Shared building blocks ───────────────────────────────────────────────────
// One button style and one OTP-code style, reused by every template below —
// so new templates (and any ported/added later) share one visual system
// instead of each hand-rolling its own inline markup.

function emailButton(href: string, label: string) {
  return `
    <div style="text-align:center;margin:28px 0;">
      <a href="${href}"
         style="display:inline-block;background:#D2042D;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        ${label}
      </a>
    </div>`;
}

function otpBlock(code: string) {
  return `
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#1a1a1a;color:#fff;letter-spacing:8px;font-size:32px;font-weight:700;padding:18px 28px;border-radius:10px;font-family:'Courier New',monospace;">
        ${code}
      </div>
    </div>`;
}

// ── Shared HTML wrapper ───────────────────────────────────────────────────────
function wrap(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#D2042D;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Ruach Assemblies</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">RuachConnect Platform</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} Ruach Assemblies · Nairobi, Kenya</p>
            <p style="margin:4px 0 0;color:#bbb;font-size:11px;">This is an automated message — please do not reply directly.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── CONNECT EMAILS ────────────────────────────────────────────────────────────

/** Sent after Connect registration is submitted */
export async function sendConnectRegistrationConfirmation(opts: {
  to: string;
  firstName: string;
  admissionNumber: string;
  cohortName: string;
  whatsappLink?: string;
}) {
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Welcome to Connect Class, ${opts.firstName}! 🎉</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your registration for <strong>${opts.cohortName}</strong> has been received. 
      Here are your details:
    </p>
    <table style="background:#f9f9f9;border-radius:8px;padding:20px;width:100%;margin-bottom:24px;">
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Admission Number</td>
        <td style="color:#1a1a1a;font-weight:700;font-size:15px;text-align:right;">${opts.admissionNumber}</td>
      </tr>
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Cohort</td>
        <td style="color:#1a1a1a;font-size:14px;text-align:right;">${opts.cohortName}</td>
      </tr>
    </table>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Please keep your admission number safe — you'll need it to access your student portal.
    </p>
    ${opts.whatsappLink ? `
    <div style="text-align:center;margin:24px 0;">
      <a href="${opts.whatsappLink}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
        Join WhatsApp Group
      </a>
    </div>` : ''}
    <p style="color:#555;font-size:14px;">We look forward to having you in class!</p>
  `);
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    `Connect Class Registration Confirmed — ${opts.admissionNumber}`, html);
}

/** Sent when a student receives a warning */
export async function sendConnectWarning(opts: {
  to: string;
  firstName: string;
  warningType: 'attendance' | 'exam' | 'general';
  message: string;
  cohortName: string;
}) {
  const typeLabel = { attendance: 'Attendance', exam: 'Exam Performance', general: 'General' }[opts.warningType];
  const html = wrap(`
    <h2 style="color:#D2042D;font-size:20px;margin:0 0 8px;">⚠️ ${typeLabel} Warning</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Dear ${opts.firstName}, this is an important notice regarding your progress in <strong>${opts.cohortName}</strong>.
    </p>
    <div style="background:#FFF3CD;border-left:4px solid #FFC107;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#664D03;font-size:14px;line-height:1.6;">${opts.message}</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Please reach out to your Connect teacher if you need assistance or have any concerns.
    </p>
  `);
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    `Connect Class — ${typeLabel} Warning`, html);
}

/** Sent when admin approves graduation */
export async function sendConnectGraduationNotice(opts: {
  to: string;
  firstName: string;
  memberId: string;
  cohortName: string;
  appUrl: string;
}) {
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Congratulations, ${opts.firstName}! 🎓</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You have successfully completed <strong>${opts.cohortName}</strong> and are now a 
      full member of Ruach Assemblies!
    </p>
    <table style="background:#f9f9f9;border-radius:8px;padding:20px;width:100%;margin-bottom:24px;">
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Your Member ID</td>
        <td style="color:#D2042D;font-weight:700;font-size:18px;text-align:right;">${opts.memberId}</td>
      </tr>
    </table>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Your Member ID gives you access to the Member Dashboard, where you can:
    </p>
    <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
      <li>Enroll in Kingdom Discipleship Classes</li>
      <li>Join a Crosspoint home fellowship</li>
      <li>Serve in ministry departments</li>
    </ul>
    ${emailButton(`${opts.appUrl}/member`, 'Access Member Dashboard')}
  `);
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    `You're a Ruach Member! Your ID is ${opts.memberId}`, html);
}

/** Sent when legacy member request is verified */
export async function sendLegacyVerificationResult(opts: {
  to: string;
  firstName: string;
  status: 'verified' | 'rejected';
  memberId?: string;
  notes?: string;
  appUrl: string;
}) {
  const html = opts.status === 'verified' ? wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Legacy Member Request Approved ✅</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Dear ${opts.firstName}, your legacy member request has been verified!
    </p>
    <table style="background:#f9f9f9;border-radius:8px;padding:20px;width:100%;margin-bottom:24px;">
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Your Member ID</td>
        <td style="color:#D2042D;font-weight:700;font-size:18px;text-align:right;">${opts.memberId}</td>
      </tr>
    </table>
    ${emailButton(`${opts.appUrl}/member`, 'Access Member Dashboard')}
  `) : wrap(`
    <h2 style="color:#D2042D;font-size:20px;margin:0 0 8px;">Legacy Member Request Update</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Dear ${opts.firstName}, unfortunately we were unable to verify your legacy member request at this time.
    </p>
    ${opts.notes ? `
    <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;color:#555;font-size:14px;"><strong>Note from admin:</strong> ${opts.notes}</p>
    </div>` : ''}
    <p style="color:#555;font-size:14px;">
      Please contact <a href="mailto:${process.env.CONNECT_EMAIL_FROM}" style="color:#D2042D;">${process.env.CONNECT_EMAIL_FROM}</a> if you believe this is an error.
    </p>
  `);
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    `Legacy Member Request — ${opts.status === 'verified' ? 'Approved' : 'Update'}`, html);
}

/** Sent when an admin creates a staff account (teacher/leader/admin/pastor) */
export async function sendStaffAccountCreated(opts: {
  to: string;
  firstName: string;
  roleLabel: string;
  tempPassword: string;
  appUrl: string;
}) {
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Welcome to RuachConnect, ${opts.firstName}!</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You've been added as a <strong>${opts.roleLabel}</strong>. Use the credentials below to sign in — you'll be prompted to set a new password after your first login.
    </p>
    <table style="background:#f9f9f9;border-radius:8px;padding:20px;width:100%;margin-bottom:24px;">
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Email</td>
        <td style="color:#1a1a1a;font-weight:700;font-size:15px;text-align:right;">${opts.to}</td>
      </tr>
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Temporary Password</td>
        <td style="color:#D2042D;font-weight:700;font-size:15px;text-align:right;font-family:monospace;">${opts.tempPassword}</td>
      </tr>
    </table>
    ${emailButton(`${opts.appUrl}/auth/login`, 'Sign In')}
  `);
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    `Your RuachConnect account is ready`, html);
}

// ── DISCIPLESHIP EMAILS ───────────────────────────────────────────────────────

/** Sent after discipleship enrollment */
export async function sendDiscipleshipEnrollmentConfirmation(opts: {
  to: string;
  firstName: string;
  admissionNumber: string;
  cohortName: string;
  level: number;
  whatsappLink?: string;
}) {
  const levelLabel = ['', 'Level 1 — Foundations of Faith', 'Level 2 — Growing in Grace', 'Level 3 — Leadership & Ministry'][opts.level];
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Enrolled in Kingdom Discipleship! 📖</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Dear ${opts.firstName}, you have been enrolled in <strong>${opts.cohortName}</strong>.
    </p>
    <table style="background:#f9f9f9;border-radius:8px;padding:20px;width:100%;margin-bottom:24px;">
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Admission Number</td>
        <td style="color:#1a1a1a;font-weight:700;font-size:15px;text-align:right;">${opts.admissionNumber}</td>
      </tr>
      <tr>
        <td style="color:#888;font-size:13px;padding:6px 0;">Programme</td>
        <td style="color:#1a1a1a;font-size:14px;text-align:right;">${levelLabel}</td>
      </tr>
    </table>
    ${opts.whatsappLink ? `
    <div style="text-align:center;margin:24px 0;">
      <a href="${opts.whatsappLink}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
        Join WhatsApp Group
      </a>
    </div>` : ''}
  `);
  await send(discipleshipTransport(), process.env.DISCIPLESHIP_EMAIL_FROM!, opts.to,
    `Discipleship Enrollment Confirmed — ${opts.admissionNumber}`, html);
}

/** Sent when a student graduates a KDC level */
export async function sendDiscipleshipGraduationNotice(opts: {
  to: string;
  firstName: string;
  level: number;
  cohortName: string;
  appUrl: string;
}) {
  const levelLabel = ['', 'Level 1 — Foundations of Faith', 'Level 2 — Growing in Grace', 'Level 3 — Leadership & Ministry'][opts.level];
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Congratulations, ${opts.firstName}! 🎓</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You have successfully completed <strong>${opts.cohortName}</strong> — ${levelLabel}.
    </p>
    ${emailButton(`${opts.appUrl}/member`, 'View My Progress')}
  `);
  await send(discipleshipTransport(), process.env.DISCIPLESHIP_EMAIL_FROM!, opts.to,
    `You've completed ${levelLabel.split(' — ')[0]}!`, html);
}

/** Sent when discipleship legacy request is resolved */
export async function sendDiscipleshipLegacyResult(opts: {
  to: string;
  firstName: string;
  status: 'verified' | 'rejected';
  level: number;
  notes?: string;
}) {
  const levelLabel = ['', 'Level 1', 'Level 2', 'Level 3'][opts.level];
  const html = opts.status === 'verified' ? wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Discipleship ${levelLabel} Verified ✅</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">
      Dear ${opts.firstName}, your completion of Kingdom Discipleship ${levelLabel} has been verified. 
      The badge has been added to your member profile.
    </p>
  `) : wrap(`
    <h2 style="color:#D2042D;font-size:20px;margin:0 0 8px;">Discipleship Legacy Request Update</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Dear ${opts.firstName}, we were unable to verify your discipleship ${levelLabel} completion at this time.
    </p>
    ${opts.notes ? `<div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;color:#555;font-size:14px;"><strong>Note:</strong> ${opts.notes}</p>
    </div>` : ''}
  `);
  await send(discipleshipTransport(), process.env.DISCIPLESHIP_EMAIL_FROM!, opts.to,
    `Discipleship Legacy — ${opts.status === 'verified' ? 'Approved' : 'Update'}`, html);
}

/** Password reset email */
export async function sendPasswordReset(opts: {
  to: string;
  firstName: string;
  resetUrl: string;
}) {
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Reset Your Password</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi ${opts.firstName}, we received a request to reset your RuachConnect password.
    </p>
    ${emailButton(opts.resetUrl, 'Reset Password')}
    <p style="color:#999;font-size:13px;text-align:center;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `);
  // Use either transport — connect is fine for auth emails
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    'Reset Your RuachConnect Password', html);
}

// ── AUTH EMAILS (platform-wide, not module-specific) ─────────────────────────

/** OTP login/signup code, sent to any module's contact-first login flow. */
export async function sendLoginCodeEmail(opts: { to: string; code: string }) {
  const html = wrap(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Your verification code</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
      Enter this code to continue signing in to RuachConnect:
    </p>
    ${otpBlock(opts.code)}
    <p style="color:#999;font-size:13px;text-align:center;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
  `);
  await send(connectTransport(), process.env.CONNECT_EMAIL_FROM!, opts.to,
    `${opts.code} is your RuachConnect verification code`, html);
}
