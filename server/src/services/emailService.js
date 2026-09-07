const resend = require("../config/resend");

const sendEmail = async ({
  to,
  subject,
  html,
  idempotencyKey,
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const { data, error } = await resend.emails.send(
    {
      from: process.env.RESEND_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    },
    idempotencyKey
      ? {
          idempotencyKey,
        }
      : undefined
  );

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};

module.exports = {
  sendEmail,
};