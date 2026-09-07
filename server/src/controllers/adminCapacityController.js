const { query } = require("../config/database");

const getCapacity = async (req, res, next) => {
  try {
    const { date } = req.query;

    const bookingDate =
      date ||
      new Date().toISOString().slice(0, 10);

    const settingResult = await query(
      `
      SELECT setting_value
      FROM site_settings
      WHERE setting_key = 'daily_site_capacity'
      LIMIT 1
      `
    );

    const dailyCapacity = Number(
      settingResult.rows[0]?.setting_value || 0
    );

    const bookedResult = await query(
      `
      SELECT
        COALESCE(
          SUM(
            adults +
            children +
            infants
          ),
          0
        ) AS booked_guests
      FROM bookings
      WHERE booking_date = $1
        AND status IN (
          'pending',
          'payment_pending',
          'confirmed'
        )
      `,
      [bookingDate]
    );

    const bookedGuests = Number(
      bookedResult.rows[0]?.booked_guests || 0
    );

    const availableGuests = Math.max(
      dailyCapacity - bookedGuests,
      0
    );

    return res.json({
      success: true,
      data: {
        date: bookingDate,
        dailyCapacity,
        bookedGuests,
        availableGuests,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCapacity,
};