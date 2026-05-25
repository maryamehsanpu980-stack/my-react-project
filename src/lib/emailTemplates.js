// src/lib/emailTemplates.js

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roadvision.pk';

const wrapper = (body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; font-family: 'Segoe UI', Arial, sans-serif; background:#f6f9fc; color:#1e293b; }
    .wrap { max-width:560px; margin:32px auto; background:#fff; border-radius:12px;
            border:1px solid #e2e8f0; overflow:hidden; }
    .header { background:linear-gradient(135deg,#0c1e3d,#0d9488); padding:28px 32px; }
    .header h1 { margin:0; color:#fff; font-size:20px; letter-spacing:-0.5px; }
    .header p  { margin:4px 0 0; color:rgba(255,255,255,0.75); font-size:13px; }
    .body  { padding:28px 32px; }
    .body p { line-height:1.65; margin:0 0 14px; font-size:15px; }
    .badge { display:inline-block; padding:4px 10px; border-radius:999px; font-size:12px;
             font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
    .badge-high   { background:#fee2e2; color:#991b1b; }
    .badge-medium { background:#fef3c7; color:#92400e; }
    .badge-low    { background:#d1fae5; color:#065f46; }
    .cta { display:inline-block; margin:8px 0 16px; padding:12px 24px;
           background:linear-gradient(135deg,#0c1e3d,#0d9488); color:#fff !important;
           border-radius:8px; font-weight:600; text-decoration:none; font-size:14px; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:20px 0; }
    .footer { padding:16px 32px; background:#f8fafc; text-align:center;
              font-size:12px; color:#64748b; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>RoadVision<span style="color:#5eead4">.pk</span></h1>
      <p>Open Pothole Detection &amp; Mapping · Lahore</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">© ${new Date().getFullYear()} RoadVision.pk &nbsp;·&nbsp;
      Built for safer Lahore roads &nbsp;·&nbsp;
      <a href="${BASE_URL}" style="color:#0d9488">Visit the map</a>
    </div>
  </div>
</body>
</html>`;

// ── Email 1: Submission received ─────────────────────────────────────────────
export function verificationEmailHTML({ name, reportId }) {
  return wrapper(`
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>Thank you for contributing to safer roads in Lahore! We've received your pothole report
       and our automated verification pipeline is now processing it.</p>
    <p><strong>Report ID:</strong> <code>${reportId}</code></p>
    <p>Here's what happens next:</p>
    <ol style="padding-left:20px;line-height:2">
      <li>Our YOLOv8 model checks whether the image shows road damage.</li>
      <li>We verify the location falls within Lahore's boundaries.</li>
      <li>We check for any nearby duplicate reports.</li>
      <li>If everything passes, your report goes live on the map immediately.</li>
    </ol>
    <p>You'll receive a follow-up email with the final outcome shortly.</p>
    <a class="cta" href="${BASE_URL}">View the live map →</a>
    <hr class="divider"/>
    <p style="font-size:13px;color:#64748b">If you didn't submit this report, you can ignore this email.</p>
  `);
}

// ── Email 2: Duplicate detected ───────────────────────────────────────────────
export function duplicateEmailHTML({ name, existingArea, existingDate }) {
  return wrapper(`
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>Thank you for your report! Our system detected that a very similar pothole has
       <strong>already been reported nearby</strong>.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Existing report area</td>
        <td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">${existingArea || 'Lahore'}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Reported on</td>
        <td style="padding:8px;border:1px solid #e2e8f0">${existingDate || 'Recently'}</td>
      </tr>
    </table>
    <p>To prevent overcrowding the map with overlapping pins, your submission has been merged
       with the existing report. Your contribution still helps us understand the ongoing severity
       of that location — thank you!</p>
    <a class="cta" href="${BASE_URL}">See the map →</a>
  `);
}

// ── Email 3: Report accepted ──────────────────────────────────────────────────
export function acceptanceEmailHTML({ name, reportId, area, severity }) {
  const badgeClass = severity === 'high' ? 'badge-high'
                   : severity === 'medium' ? 'badge-medium' : 'badge-low';
  return wrapper(`
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>🎉 Great news — your pothole report has been <strong>verified and is now live</strong> on the
       RoadVision.pk map!</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Report ID</td>
        <td style="padding:8px;border:1px solid #e2e8f0;font-weight:600"><code>${reportId}</code></td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Location</td>
        <td style="padding:8px;border:1px solid #e2e8f0">${area || 'Lahore'}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Severity</td>
        <td style="padding:8px;border:1px solid #e2e8f0">
          <span class="badge ${badgeClass}">${severity}</span>
        </td>
      </tr>
    </table>
    <p>Your name will appear on our <strong>Contributors</strong> page as a verified reporter.
       Every report helps authorities prioritise which roads to fix first.</p>
    <a class="cta" href="${BASE_URL}">View your report on the map →</a>
    <hr class="divider"/>
    <p style="font-size:13px;color:#64748b">Share RoadVision.pk with friends and family to grow our
       community of road reporters!</p>
  `);
}

// ── Email 4: Report rejected ──────────────────────────────────────────────────
export function rejectionEmailHTML({ name, reason }) {
  const reasons = {
    no_damage:    'Our AI model could not detect road damage in the uploaded image. Please ensure the photo shows a clear view of the pothole or surface damage.',
    out_of_bounds:'The GPS location in your image falls outside Lahore\'s city boundary. RoadVision.pk currently covers only Lahore. We hope to expand to other cities soon.',
    ai_generated: 'Our system flagged the uploaded image as potentially AI-generated or synthetically edited. We only accept authentic photographs taken at the reported location.',
    no_gps:       'We could not determine the location of this image. Please enable GPS on your camera before taking the photo, or use the map pin to manually specify the location.',
    other:        'Your submission did not meet our verification criteria.',
  };
  const message = reasons[reason] || reasons.other;
  return wrapper(`
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>Thank you for taking the time to report a pothole. Unfortunately, we were unable to add
       your submission to the map for the following reason:</p>
    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;
                border-radius:0 8px 8px 0;margin:12px 0;font-size:14px;line-height:1.6">
      ${message}
    </div>
    <p>You're welcome to submit a new report with a clearer photo. Here are some tips:</p>
    <ul style="padding-left:20px;line-height:2;font-size:14px;color:#475569">
      <li>Take the photo in daylight with the pothole clearly visible</li>
      <li>Ensure GPS / location services are enabled on your phone</li>
      <li>Use an authentic, unedited photograph from your camera roll</li>
      <li>Make sure you are within Lahore city limits</li>
    </ul>
    <a class="cta" href="${BASE_URL}/upload">Submit a new report →</a>
  `);
}