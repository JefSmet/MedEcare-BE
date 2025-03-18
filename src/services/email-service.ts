/**
 * @description
 * A simple service for sending emails using SendGrid's @sendgrid/mail library.
 * Currently provides one main function:
 *   - sendResetEmail: sends a password reset link to a specified user.
 *
 * Key features:
 * - Configures the SendGrid API key from environment variables
 * - Exports straightforward functions for sending specific email types
 *
 * @dependencies
 * - @sendgrid/mail: Official SendGrid client for Node.js
 *
 * @notes
 * - Ensure that SENDGRID_API_KEY is defined in your .env.local file.
 * - In production, you should handle errors carefully and possibly queue emails.
 */

import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * @function sendResetEmail
 * @description Sends an email with a link to reset the user's password.
 *
 * @param {string} recipient - The email address of the user needing the reset
 * @param {string} resetLink - A URL containing the reset token as a query param or path param
 * @returns {Promise<void>} - Resolves when the email is successfully sent
 *
 * @example
 *   await sendResetEmail("user@example.com", "https://yourapp.com/reset?token=abc123");
 */
export async function sendResetEmail(
  recipient: string,
  resetLink: string,
): Promise<void> {
  const msg = {
    to: recipient,
    from: 'no-reply@yourdomain.com', // Change to your verified sender
    subject: 'Password Reset Request',
    text: `We received a request to reset your password. Please click the link below:
${resetLink}`,
    html: `
      <p>We received a request to reset your password.</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
    `,
  };

  // Attempt to send the message
  await sgMail.send(msg);
}
