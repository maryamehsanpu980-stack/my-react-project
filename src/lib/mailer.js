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
export async function sendDuplicateEmail({ to, name, existingArea, existingDate }) {
  await transporter.sendMail({
    from: `"RoadVision.pk" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Duplicate pothole report detected — RoadVision.pk',
    html: duplicateEmailHTML({ name, existingArea, existingDate }),
  });
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