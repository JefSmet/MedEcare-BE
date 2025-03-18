/**
 * @description
 * A flexible email service that can send emails via multiple providers:
 * 1. SendGrid (existing integration)
 * 2. Resend
 * 3. Nodemailer
 *
 * Key features:
 * - Select provider by setting `EMAIL_PROVIDER` in environment variables to "sendgrid", "resend", or "nodemailer".
 * - All provider-specific API keys or SMTP settings must be set accordingly in `.env.local`.
 * - Provides a `sendEmail` function for general email sending, plus a specialized `sendResetEmail` as an example use case.
 *
 * @dependencies
 * - @sendgrid/mail (for SendGrid)
 * - resend (for Resend)
 * - nodemailer (for SMTP-based sending)
 *
 * @notes
 * - Ensure you run `npm install nodemailer resend @sendgrid/mail` if you haven't already.
 * - `EMAIL_PROVIDER` defaults to "sendgrid" if not specified.
 * - For Nodemailer, you must configure SMTP credentials: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.
 * - For Resend, set RESEND_API_KEY.
 * - For SendGrid, set SENDGRID_API_KEY.
 */

import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid';

// Set up SendGrid (existing)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Set up Resend
let resend: Resend | null = null;
if (EMAIL_PROVIDER === 'resend') {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
  if (RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
  }
}

// Nodemailer transporter
let transporter: nodemailer.Transporter | null = null;
if (EMAIL_PROVIDER === 'nodemailer') {
  // Attempt to read SMTP settings
  const smtpHost = process.env.SMTP_HOST || '';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASSWORD || '';

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // set to true if your SMTP provider uses TLS/SSL on the port
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * @function sendEmail
 * @description Sends an email using the selected provider. 
 * If EMAIL_PROVIDER is not set, defaults to SendGrid.
 *
 * @param {string} recipient - The destination email address
 * @param {string} subject - The subject line of the email
 * @param {string} text - The plain text body of the email
 * @param {string} [html] - Optional HTML body. If omitted, 'text' is used.
 *
 * @returns {Promise<void>} Resolves when the email has been successfully sent
 *
 * @example
 *   await sendEmail("user@example.com", "Hello World", "Some text content", "<p>HTML content</p>");
 */
export async function sendEmail(
  recipient: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  const chosenProvider = EMAIL_PROVIDER.toLowerCase();
  const finalHtml = html || `<p>${text}</p>`; // fallback if HTML not provided

  switch (chosenProvider) {
    case 'resend':
      if (!resend) {
        throw new Error(
          'Resend is selected but RESEND_API_KEY is missing or not set properly.',
        );
      }
      // Using the official Resend client
      await resend.emails.send({
        from: 'no-reply@yourdomain.com', // Must be verified domain/sender with Resend
        to: recipient,
        subject,
        html: finalHtml,
        text,
      });
      break;

    case 'nodemailer':
      if (!transporter) {
        throw new Error(
          'Nodemailer is selected but SMTP credentials are missing or invalid.',
        );
      }
      await transporter.sendMail({
        from: 'no-reply@yourdomain.com', // Adjust to your actual "from" email
        to: recipient,
        subject,
        text,
        html: finalHtml,
      });
      break;

    case 'sendgrid':
    default:
      if (!SENDGRID_API_KEY) {
        throw new Error(
          'SendGrid is selected but SENDGRID_API_KEY is missing or not set.',
        );
      }
      const msg = {
        to: recipient,
        from: 'no-reply@yourdomain.com', // Must match a verified sender in SendGrid
        subject,
        text,
        html: finalHtml,
      };
      await sgMail.send(msg);
      break;
  }
}

/**
 * @function sendResetEmail
 * @description
 * A specialized function that sends a password reset email, reusing `sendEmail`.
 *
 * @param {string} recipient - The email address of the user needing the reset
 * @param {string} resetLink - A URL containing the reset token or relevant parameter
 *
 * @returns {Promise<void>} - Resolves when the email is sent
 *
 * @example
 *  await sendResetEmail("user@example.com", "https://yourapp.com/reset?token=abc123");
 */
export async function sendResetEmail(
  recipient: string,
  resetLink: string,
): Promise<void> {
  const subject = 'Password Reset Request';
  const text = `We received a request to reset your password. Click the link below to reset it:\n${resetLink}`;
  const html = `
    <p>We received a request to reset your password.</p>
    <p>Please click the link below to reset your password:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
  `;

  await sendEmail(recipient, subject, text, html);
}

