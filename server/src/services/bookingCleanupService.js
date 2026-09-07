const { query } = require("../config/database");

const expirePendingBookings = async () => {
  const settingResult = await query(
    `
    SELECT setting_value
    FROM site_settings
    WHERE setting_key = 'payment_pending_expiry_minutes'
    LIMIT 1
    `
  );

  const expiryMinutes = Number(
    settingResult.rows[0]?.setting_value || 30
  );

  if (
    !Number.isFinite(expiryMinutes) ||
    expiryMinutes <= 0
  ) {
    console.error(
      "Invalid payment_pending_expiry_minutes setting."
    );

    return [];
  }

  const result = await query(
    `
    UPDATE bookings
    SET
      status = 'expired',
      updated_at = NOW()
    WHERE status = 'payment_pending'
      AND created_at <= NOW()
        - ($1 * INTERVAL '1 minute')
    RETURNING
      id,
      booking_reference
    `,
    [expiryMinutes]
  );

  if (result.rows.length > 0) {
    console.log(
      `Expired ${result.rows.length} payment-pending booking(s):`,
      result.rows.map(
        (booking) =>
          booking.booking_reference
      )
    );
  }

  return result.rows;
};

module.exports = {
  expirePendingBookings,
};