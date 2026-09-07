const { query } = require("../config/database");

const {
  createNotification,
  markNotificationSent,
  markNotificationFailed,
} = require("./notificationService");

const {
  sendBookingConfirmationEmail,
  sendAdminBookingNotification,
  sendCancellationEmail,
  sendAdminCancellationNotification,
} = require("./bookingEmailService");

const getBookingForNotification = async (bookingId) => {
  const result = await query(
    `
      SELECT
        b.*,

        p.name AS package_name,
        p.duration,
        p.accommodation,
        p.check_in_time,
        p.check_out_time

      FROM bookings b

      INNER JOIN packages p
        ON p.id = b.package_id

      WHERE b.id = $1

      LIMIT 1
    `,
    [bookingId]
  );

  return result.rows[0] || null;
};

const sendBookingNotifications = async (bookingId) => {
  const booking = await getBookingForNotification(bookingId);

  if (!booking) {
    throw new Error("Booking not found for notification");
  }

  /*
   * CUSTOMER EMAIL
   */

  const existingCustomerNotification = await query(
    `
      SELECT id
      FROM notifications
      WHERE booking_id = $1
        AND channel = 'email'
        AND recipient = $2
        AND subject LIKE 'Booking Confirmed%'
        AND status = 'sent'
      LIMIT 1
    `,
    [
      booking.id,
      booking.customer_email,
    ]
  );

  if (
    booking.customer_email &&
    existingCustomerNotification.rows.length === 0
  ) {
    const notification = await createNotification({
      bookingId: booking.id,
      channel: "email",
      recipient: booking.customer_email,
      subject: `Booking Confirmed — ${booking.booking_reference}`,
      message: `Booking confirmation for ${booking.booking_reference}`,
    });

    try {
      const result =
        await sendBookingConfirmationEmail(booking);

      await markNotificationSent({
        notificationId: notification.id,
        providerMessageId: result?.id || null,
      });
    } catch (error) {
      console.error(
        "Customer email failed:",
        error.message
      );

      await markNotificationFailed({
        notificationId: notification.id,
        errorMessage: error.message,
      });
    }
  }

  /*
   * ADMIN EMAIL
   */

  const existingAdminNotification = await query(
    `
      SELECT id
      FROM notifications
      WHERE booking_id = $1
        AND channel = 'email'
        AND recipient = $2
        AND subject LIKE 'New Booking%'
        AND status = 'sent'
      LIMIT 1
    `,
    [
      booking.id,
      process.env.ADMIN_EMAIL,
    ]
  );

  if (
    process.env.ADMIN_EMAIL &&
    existingAdminNotification.rows.length === 0
  ) {
    const notification = await createNotification({
      bookingId: booking.id,
      channel: "email",
      recipient: process.env.ADMIN_EMAIL,
      subject: `New Booking — ${booking.booking_reference}`,
      message: `New confirmed booking ${booking.booking_reference}`,
    });

    try {
      const result =
        await sendAdminBookingNotification(booking);

      await markNotificationSent({
        notificationId: notification.id,
        providerMessageId: result?.id || null,
      });
    } catch (error) {
      console.error(
        "Admin email failed:",
        error.message
      );

      await markNotificationFailed({
        notificationId: notification.id,
        errorMessage: error.message,
      });
    }
  }
};

const sendCancellationNotifications = async (
  bookingId,
  refund
) => {
  const booking =
    await getBookingForNotification(
      bookingId
    );

  if (!booking) {
    throw new Error(
      "Booking not found for cancellation notification"
    );
  }

  /*
   * CUSTOMER EMAIL
   */

  if (booking.customer_email) {
    const existingCustomer =
      await query(
        `
        SELECT id
        FROM notifications
        WHERE booking_id = $1
          AND channel = 'email'
          AND recipient = $2
          AND subject = $3
          AND status = 'sent'
        LIMIT 1
        `,
        [
          booking.id,
          booking.customer_email,
          `Booking Cancelled - ${booking.booking_reference}`,
        ]
      );

    if (existingCustomer.rows.length === 0) {
      const notification =
        await createNotification({
          bookingId: booking.id,
          channel: "email",
          recipient: booking.customer_email,
          subject:
            `Booking Cancelled - ${booking.booking_reference}`,
          message:
            `Cancellation and refund processed for ${booking.booking_reference}`,
        });

      try {
        const result =
          await sendCancellationEmail(
            booking,
            refund
          );

        await markNotificationSent({
          notificationId:
            notification.id,
          providerMessageId:
            result?.id || null,
        });
      } catch (error) {
        console.error(
          "Cancellation customer email failed:",
          error.message
        );

        await markNotificationFailed({
          notificationId:
            notification.id,
          errorMessage:
            error.message,
        });
      }
    }
  }

  /*
   * ADMIN EMAIL
   */

  if (process.env.ADMIN_EMAIL) {
    const adminSubject =
      `Booking Cancelled - ${booking.booking_reference}`;

    const existingAdmin =
      await query(
        `
        SELECT id
        FROM notifications
        WHERE booking_id = $1
          AND channel = 'email'
          AND recipient = $2
          AND subject = $3
          AND status = 'sent'
        LIMIT 1
        `,
        [
          booking.id,
          process.env.ADMIN_EMAIL,
          adminSubject,
        ]
      );

    if (existingAdmin.rows.length === 0) {
      const notification =
        await createNotification({
          bookingId: booking.id,
          channel: "email",
          recipient:
            process.env.ADMIN_EMAIL,
          subject: adminSubject,
          message:
            `Booking ${booking.booking_reference} cancelled and refund processed`,
        });

      try {
        const result =
          await sendAdminCancellationNotification(
            booking,
            refund
          );

        await markNotificationSent({
          notificationId:
            notification.id,
          providerMessageId:
            result?.id || null,
        });
      } catch (error) {
        console.error(
          "Cancellation admin email failed:",
          error.message
        );

        await markNotificationFailed({
          notificationId:
            notification.id,
          errorMessage:
            error.message,
        });
      }
    }
  }
};

module.exports = {
  sendBookingNotifications,
    sendCancellationNotifications,
};