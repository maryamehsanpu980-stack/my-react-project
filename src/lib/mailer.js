// src/lib/mailer.js
import nodemailer from 'nodemailer';
import {
  verificationEmailHTML,
  duplicateEmailHTML,
  acceptanceEmailHTML,
  rejectionEmailHTML,
} from './emailTemplates.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter
  .verify()
  .then(() => console.log('Mailer transporter verified (SMTP connection OK)'))
  .catch((err) => console.error('Mailer transporter verification failed', err && err.message ? err.message : err));

/**
 * Sends an email confirming the submission was received and is under review.
 * Called immediately on upload, before verification completes.
 */
export async function sendVerificationEmail({ to, name, reportId }) {
  await transporter.sendMail({
    from: `"RoadVision.pk" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'We received your pothole report — RoadVision.pk',
    html: verificationEmailHTML({ name, reportId }),
  });
}

/**
 * Sent when an uploaded image matches an existing detection within 20 metres.
 */
export async function sendDuplicateEmail({
  to,
  name,
  existingArea,
  existingDate,
}) {
  try {
    console.log("Sending duplicate pothole email...", {
      to,
      name,
      existingArea,
      existingDate,
    });

    const info = await transporter.sendMail({
      from: `"RoadVision.pk" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Duplicate pothole report detected — RoadVision.pk",
      html: duplicateEmailHTML({
        name,
        existingArea,
        existingDate,
      }),
    });

    console.log("Duplicate email sent successfully", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return info;
  } catch (error) {
    console.error("Failed to send duplicate email", {
      error: error.message,
      stack: error.stack,
      to,
      name,
    });

    throw error;
  }
}

/**
 * Sent when the report passes all checks and is added to the live map.
 */
export async function sendAcceptanceEmail({ to, name, reportId, area, severity }) {
  await transporter.sendMail({
    from: `"RoadVision.pk" <${process.env.GMAIL_USER}>`,
    to,
    subject: '✅ Your report is live on the map — RoadVision.pk',
    html: acceptanceEmailHTML({ name, reportId, area, severity }),
  });
  console.log(`Acceptance email sent to ${to} for report ${reportId}`);
}

/**
 * Sent when the report is rejected, with the specific reason.
 */
export async function sendRejectionEmail({ to, name, reason }) {
  await transporter.sendMail({
    from: `"RoadVision.pk" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your report could not be added — RoadVision.pk',
    html: rejectionEmailHTML({ name, reason }),
  });
}