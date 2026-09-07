const { query } = require("../config/database");

const expireStalePayments = async () => {
  const result = await query(`
    UPDATE payments
    SET
      status = 'failed',
      updated_at = NOW()
    WHERE status IN ('created', 'authorized')
      AND created_at <= NOW() - INTERVAL '30 minutes'
      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.id = payments.booking_id
          AND b.status = 'confirmed'
      )
    RETURNING
      id,
      booking_id,
      provider_order_id,
      provider_payment_id
  `);

  if (result.rows.length > 0) {
    console.log(
      `Expired ${result.rows.length} stale payment(s).`
    );
  }

  return result.rows;
};

module.exports = {
  expireStalePayments,
};