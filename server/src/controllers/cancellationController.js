const { pool } = require("../config/database");
const {
  createRazorpayRefund,
} = require("../config/razorpay");
const {
  sendCancellationNotifications,
} = require("../services/bookingNotificationService");

const cancelBooking = async (req, res) => {
  const client = await pool.connect();

  try {
    const { bookingReference } = req.params;
    const {
        customerEmail,
        customerPhone,
        reason = null,
        } = req.body || {};

    

    await client.query("BEGIN");

    /*
     * Lock booking so two cancellation requests
     * cannot process the same booking simultaneously.
     */
    const bookingResult = await client.query(
    `
    SELECT
        b.*
    FROM bookings b
    WHERE b.booking_reference = $1
    FOR UPDATE
    `,
    [bookingReference]
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    let customerVerified = false;

    if (
    customerEmail &&
    booking.customer_email
    ) {
    customerVerified =
        String(customerEmail)
        .trim()
        .toLowerCase() ===
        String(booking.customer_email)
        .trim()
        .toLowerCase();
    }

    if (
    !customerVerified &&
    customerPhone &&
    booking.customer_phone
    ) {
    const inputPhone =
        String(customerPhone).replace(
        /\D/g,
        ""
        );

    const bookingPhone =
        String(booking.customer_phone).replace(
        /\D/g,
        ""
        );

    customerVerified =
        inputPhone === bookingPhone;
    }

    if (!customerVerified) {
    await client.query("ROLLBACK");

    return res.status(401).json({
        success: false,
        message:
        "Booking details could not be verified.",
    });
    }

    /*
     * Idempotency:
     * already cancelled means don't process again.
     */
    if (booking.status === "cancelled") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status !== "confirmed") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Only confirmed bookings can be cancelled.",
      });
    }

    /*
     * Find captured payment.
     */
    const paymentResult = await client.query(
    `
    SELECT *
    FROM payments
    WHERE booking_id = $1
        AND status = 'captured'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [booking.id]
    );

    if (paymentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "No captured payment found for this booking.",
      });
    }

    const payment = paymentResult.rows[0];

    if (!payment.provider_payment_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment ID is missing.",
      });
    }

    /*
     * Check whether a refund already exists.
     */
    const existingRefundResult = await client.query(
      `
      SELECT *
      FROM refunds
      WHERE payment_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [payment.id]
    );

    if (existingRefundResult.rows.length > 0) {
      const existingRefund =
        existingRefundResult.rows[0];

      await client.query("ROLLBACK");

      if (existingRefund.status !== "failed") {
        await pool.query(
          `
          UPDATE bookings
          SET
            status = 'cancelled',
            updated_at = NOW()
          WHERE id = $1
            AND status = 'confirmed'
          `,
          [booking.id]
        );

        try {
          await sendCancellationNotifications(
            booking.id,
            existingRefund
          );
        } catch (notificationError) {
          console.error(
            "Cancellation notification process failed:",
            notificationError.message
          );
        }

        return res.status(200).json({
          success: true,
          message:
            "A refund has already been initiated for this payment.",
          data: {
            refundId: existingRefund.id,
            refundStatus: existingRefund.status,
          },
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "A refund has already been created for this payment.",
        data: {
          refundId: existingRefund.id,
          refundStatus: existingRefund.status,
        },
      });
    }

    /*
     * Calculate calendar days before arrival.
     */
    const daysResult = await client.query(
      `
      SELECT
        GREATEST(
          0,
          ($1::date - CURRENT_DATE)
        ) AS days_before_arrival
      `,
      [booking.booking_date]
    );

    const daysBeforeArrival = Number(
      daysResult.rows[0].days_before_arrival
    );

    /*
     * Find applicable policy.
     *
     * Package-specific policy has priority
     * over global policy.
     */
    const policyResult = await client.query(
      `
      SELECT
        id,
        package_id,
        name,
        refund_percentage,
        minimum_days_before_arrival,
        description
      FROM cancellation_policies
      WHERE is_active = true
        AND (
          package_id = $1
          OR package_id IS NULL
        )
        AND minimum_days_before_arrival <= $2
      ORDER BY
        CASE
          WHEN package_id = $1 THEN 0
          ELSE 1
        END,
        minimum_days_before_arrival DESC,
        created_at DESC
      LIMIT 1
      `,
      [
        booking.package_id,
        daysBeforeArrival,
      ]
    );

    if (policyResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "No applicable cancellation policy was found.",
      });
    }

    const policy = policyResult.rows[0];

    const refundPercentage = Number(
      policy.refund_percentage
    );

    const totalAmount = Number(
      booking.total_amount
    );

    const refundAmount = Number(
      (
        totalAmount *
        refundPercentage /
        100
      ).toFixed(2)
    );

    /*
     * Zero refund:
     * cancel booking without calling Razorpay.
     */
    if (refundAmount === 0) {
      await client.query(
        `
        INSERT INTO refunds (
          payment_id,
          booking_id,
          provider,
          amount,
          currency,
          status,
          refund_percentage,
          cancellation_policy_id,
          reason
        )
        VALUES (
          $1,
          $2,
          'razorpay',
          $3,
          $4,
          'completed',
          $5,
          $6,
          $7
        )
        `,
        [
          payment.id,
          booking.id,
          0,
          booking.currency,
          refundPercentage,
          policy.id,
          reason,
        ]
      );

      await client.query(
        `
        UPDATE bookings
        SET
          status = 'cancelled',
          updated_at = NOW()
        WHERE id = $1
        `,
        [booking.id]
      );

      await client.query("COMMIT");

      try {
        await sendCancellationNotifications(
          booking.id,
          {
            amount: 0,
            refund_percentage: refundPercentage,
            status: "completed",
          }
        );
      } catch (notificationError) {
        console.error(
          "Cancellation notification process failed:",
          notificationError.message
        );
      }

      return res.json({
        success: true,
        message: "Booking cancelled successfully.",
        data: {
          bookingReference:
            booking.booking_reference,
          status: "cancelled",
          refundPercentage,
          refundAmount: 0,
          currency: booking.currency,
          policy: {
            id: policy.id,
            name: policy.name,
          },
        },
      });
    }

    /*
     * Create refund record FIRST.
     *
     * This gives us a durable record that the refund
     * process has started.
     */
    const refundInsertResult = await client.query(
      `
      INSERT INTO refunds (
        payment_id,
        booking_id,
        provider,
        amount,
        currency,
        status,
        refund_percentage,
        cancellation_policy_id,
        reason
      )
      VALUES (
        $1,
        $2,
        'razorpay',
        $3,
        $4,
        'processing',
        $5,
        $6,
        $7
      )
      RETURNING id
      `,
      [
        payment.id,
        booking.id,
        refundAmount,
        booking.currency,
        refundPercentage,
        policy.id,
        reason,
      ]
    );

    const refundRecord =
      refundInsertResult.rows[0];

    await client.query("COMMIT");

    /*
     * Razorpay API call happens AFTER the DB transaction.
     */
    const refundAmountInPaise = Math.round(
      refundAmount * 100
    );

    let razorpayRefund;

    try {
      razorpayRefund =
        await createRazorpayRefund(
          payment.provider_payment_id,
          refundAmountInPaise
        );
    } catch (razorpayError) {
      console.error(
        "Razorpay refund failed:",
        razorpayError
      );

      await pool.query(
        `
        UPDATE refunds
        SET
          status = 'failed',
          raw_response = $1::jsonb,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          JSON.stringify({
            error:
              razorpayError?.error ||
              razorpayError?.message ||
              String(razorpayError),
          }),
          refundRecord.id,
        ]
      );

      return res.status(502).json({
        success: false,
        message:
          "Refund could not be initiated. Your booking remains confirmed.",
      });
    }

    /*
     * Save Razorpay refund result.
     */
    await pool.query(
      `
      UPDATE refunds
      SET
        provider_refund_id = $1,
        status = $2,
        raw_response = $3::jsonb,
        updated_at = NOW()
      WHERE id = $4
      `,
      [
        razorpayRefund.id,
        "processing",
        JSON.stringify(razorpayRefund),
        refundRecord.id,
      ]
    );

    await pool.query(
      `
      UPDATE bookings
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = $1
        AND status = 'confirmed'
      `,
      [booking.id]
    );

    try {
      await sendCancellationNotifications(
        booking.id,
        {
          ...razorpayRefund,
          amount: refundAmount,
          refund_percentage: refundPercentage,
          status: "processing",
        }
      );
    } catch (notificationError) {
      console.error(
        "Cancellation notification process failed:",
        notificationError.message
      );
    }

    return res.json({
      success: true,
      message:
        "Cancellation request received. Your refund is being processed.",
      data: {
        bookingReference:
          booking.booking_reference,
        status: "cancelled",
        refundId: refundRecord.id,
        providerRefundId:
          razorpayRefund.id,
        refundStatus:
          razorpayRefund.status,
        refundPercentage,
        refundAmount,
        currency: booking.currency,
        daysBeforeArrival,
        policy: {
          id: policy.id,
          name: policy.name,
        },
      },
    });
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error
    );

    try {
      await client.query("ROLLBACK");
    } catch {}

    return res.status(500).json({
      success: false,
      message:
        "Unable to process booking cancellation.",
    });
  } finally {
    client.release();
  }
};

const getCancellationPreview = async (req, res) => {
  try {
    const { bookingReference } = req.params;

    const {
      customerEmail,
      customerPhone,
    } = req.body || {};

    if (!customerEmail && !customerPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Customer email or phone number is required.",
      });
    }

    const bookingResult = await pool.query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.package_id,
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.booking_date,
        b.total_amount,
        b.currency,
        b.status,
        p.name AS package_name
      FROM bookings b
      LEFT JOIN packages p
        ON p.id = b.package_id
      WHERE b.booking_reference = $1
      LIMIT 1
      `,
      [bookingReference]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const booking = bookingResult.rows[0];

    /*
     * Verify customer ownership.
     *
     * Email comparison is case-insensitive.
     * Phone comparison removes common formatting.
     */
    let customerVerified = false;

    if (customerEmail && booking.customer_email) {
      customerVerified =
        String(customerEmail)
          .trim()
          .toLowerCase() ===
        String(booking.customer_email)
          .trim()
          .toLowerCase();
    }

    if (
      !customerVerified &&
      customerPhone &&
      booking.customer_phone
    ) {
      const normalizedInputPhone =
        String(customerPhone).replace(/\D/g, "");

      const normalizedBookingPhone =
        String(booking.customer_phone).replace(
          /\D/g,
          ""
        );

      customerVerified =
        normalizedInputPhone ===
        normalizedBookingPhone;
    }

    if (!customerVerified) {
      /*
       * Don't reveal whether the booking exists
       * for an incorrect identity attempt.
       */
      return res.status(401).json({
        success: false,
        message:
          "Booking details could not be verified.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(409).json({
        success: false,
        message: "This booking is already cancelled.",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "Only confirmed bookings can be cancelled.",
      });
    }

    /*
     * Verify there is a captured payment.
     */
    const paymentResult = await pool.query(
      `
      SELECT
        id,
        provider,
        provider_payment_id,
        amount,
        currency,
        status
      FROM payments
      WHERE booking_id = $1
        AND provider = 'razorpay'
        AND status = 'captured'
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [booking.id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No captured payment is available for this booking.",
      });
    }

    const payment = paymentResult.rows[0];

    if (!payment.provider_payment_id) {
      return res.status(400).json({
        success: false,
        message:
          "Payment information is incomplete.",
      });
    }

    /*
     * Calculate days before arrival.
     */
    const daysResult = await pool.query(
      `
      SELECT
        GREATEST(
          0,
          ($1::date - CURRENT_DATE)
        ) AS days_before_arrival
      `,
      [booking.booking_date]
    );

    const daysBeforeArrival = Number(
      daysResult.rows[0].days_before_arrival
    );

    /*
     * Find applicable cancellation policy.
     *
     * Package-specific policy takes priority
     * over global policy.
     */
    const policyResult = await pool.query(
      `
      SELECT
        id,
        package_id,
        name,
        refund_percentage,
        minimum_days_before_arrival,
        description
      FROM cancellation_policies
      WHERE is_active = true
        AND (
          package_id = $1
          OR package_id IS NULL
        )
        AND minimum_days_before_arrival <= $2
      ORDER BY
        CASE
          WHEN package_id = $1 THEN 0
          ELSE 1
        END,
        minimum_days_before_arrival DESC,
        created_at DESC
      LIMIT 1
      `,
      [
        booking.package_id,
        daysBeforeArrival,
      ]
    );

    if (policyResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No applicable cancellation policy was found.",
      });
    }

    const policy = policyResult.rows[0];

    const refundPercentage = Number(
      policy.refund_percentage
    );

    const totalAmount = Number(
      booking.total_amount
    );

    const refundAmount = Number(
      (
        totalAmount *
        refundPercentage /
        100
      ).toFixed(2)
    );

    const cancellationFee = Number(
      (
        totalAmount -
        refundAmount
      ).toFixed(2)
    );

    return res.json({
      success: true,
      data: {
        booking: {
          reference:
            booking.booking_reference,
          customerName:
            booking.customer_name,
          packageName:
            booking.package_name,
          bookingDate:
            booking.booking_date,
          totalAmount,
          currency:
            booking.currency,
        },

        cancellation: {
          daysBeforeArrival,
          refundPercentage,
          refundAmount,
          cancellationFee,
          currency:
            booking.currency,
        },

        policy: {
          id: policy.id,
          name: policy.name,
          description:
            policy.description,
          minimumDaysBeforeArrival:
            Number(
              policy.minimum_days_before_arrival
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Cancellation preview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate cancellation preview.",
    });
  }
};

module.exports = {
  cancelBooking,
  getCancellationPreview,
};