const { query } = require("../config/database");

const createNotification = async ({
  bookingId,
  channel,
  recipient,
  subject,
  message,
}) => {
  const result = await query(
    `
      INSERT INTO notifications (
        booking_id,
        channel,
        recipient,
        subject,
        message,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `,
    [
      bookingId,
      channel,
      recipient,
      subject,
      message,
    ]
  );

  return result.rows[0];
};

const markNotificationSent = async ({
  notificationId,
  providerMessageId,
}) => {
  const result = await query(
    `
      UPDATE notifications
      SET
        status = 'sent',
        provider_message_id = $1,
        sent_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [
      providerMessageId,
      notificationId,
    ]
  );

  return result.rows[0];
};

const markNotificationFailed = async ({
  notificationId,
  errorMessage,
}) => {
  const result = await query(
    `
      UPDATE notifications
      SET
        status = 'failed',
        error_message = $1
      WHERE id = $2
      RETURNING *
    `,
    [
      errorMessage,
      notificationId,
    ]
  );

  return result.rows[0];
};

module.exports = {
  createNotification,
  markNotificationSent,
  markNotificationFailed,
};