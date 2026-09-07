const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const { pool } = require("../config/database");
const {
  sendBookingNotifications,
} = require("../services/bookingNotificationService");

const createPaymentOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    await client.query("BEGIN");

    const bookingResult = await client.query(
      `
      SELECT
        id,
        booking_reference,
        customer_name,
        customer_phone,
        customer_email,
        total_amount,
        currency,
        status
      FROM bookings
      WHERE id = $1
      FOR UPDATE
      `,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    if (
    booking.status === "pending" &&
    req.customer
    ) {
    booking.status = "payment_pending";
    }

    if (
      !["pending", "payment_pending"].includes(
        booking.status
      )
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "This booking is not available for payment",
      });
    }

    const amount = Number(
      booking.total_amount
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    /*
     * INR → paise
     */
    const amountInPaise = Math.round(
      amount * 100
    );

    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
            success: false,
            message: "Invalid payment amount",
        });
        }

    /*
     * Reuse an existing active Razorpay order.
     */
    const existingPayment =
      await client.query(
        `
        SELECT
          id,
          provider_order_id,
          status
        FROM payments
        WHERE booking_id = $1
          AND provider = 'razorpay'
          AND status IN ('created', 'authorized')
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [bookingId]
      );

    if (
      existingPayment.rows.length > 0 &&
      existingPayment.rows[0]
        .provider_order_id
    ) {
      const payment =
        existingPayment.rows[0];

      await client.query("COMMIT");

      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          orderId:
            payment.provider_order_id,
          amount: amountInPaise,
          currency: booking.currency,
          keyId:
            process.env.RAZORPAY_KEY_ID,
          bookingReference:
            booking.booking_reference,
        },
      });
    }

    /*
     * Create Razorpay order.
     */
    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: booking.currency,
        receipt:
          booking.booking_reference,
        notes: {
          booking_id: booking.id,
          booking_reference:
            booking.booking_reference,
        },
        partial_payment: false,
      });

    /*
     * Save payment order.
     */
    const paymentResult =
      await client.query(
        `
        INSERT INTO payments (
          booking_id,
          provider,
          provider_order_id,
          amount,
          currency,
          status,
          raw_response
        )
        VALUES (
          $1,
          'razorpay',
          $2,
          $3,
          $4,
          'created',
          $5
        )
        RETURNING id
        `,
        [
          booking.id,
          razorpayOrder.id,
          amount,
          booking.currency,
          JSON.stringify(
            razorpayOrder
          ),
        ]
      );

    await client.query(
      `
      UPDATE bookings
      SET
        status = 'payment_pending',
        updated_at = NOW()
      WHERE id = $1
      `,
      [booking.id]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      data: {
        paymentId:
          paymentResult.rows[0].id,

        orderId:
          razorpayOrder.id,

        amount:
          amountInPaise,

        currency:
          booking.currency,

        keyId:
          process.env.RAZORPAY_KEY_ID,

        bookingReference:
          booking.booking_reference,

        customer: {
          name:
            booking.customer_name,

          email:
            booking.customer_email,

          phone:
            booking.customer_phone,
        },
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    next(error);
  } finally {
    client.release();
  }
};


/*
|--------------------------------------------------------------------------
| Verify Checkout signature
|--------------------------------------------------------------------------
*/

const verifyPayment = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    /*
     * Find the payment order that we created.
     */
    const paymentResult = await client.query(
      `
      SELECT
        p.id,
        p.booking_id,
        p.provider_order_id,
        p.amount,
        p.currency,
        p.status,
        b.total_amount AS booking_total_amount,
        b.status AS booking_status
      FROM payments p
      JOIN bookings b
        ON b.id = p.booking_id
      WHERE p.provider = 'razorpay'
        AND p.provider_order_id = $1
      LIMIT 1
      `,
      [razorpay_order_id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    const payment = paymentResult.rows[0];

    /*
     * Verify that our stored payment order belongs
     * to the same booking amount.
     */
    const storedPaymentAmount = Number(
      payment.amount
    );

    const bookingAmount = Number(
      payment.booking_total_amount
    );

    if (
      !Number.isFinite(storedPaymentAmount) ||
      !Number.isFinite(bookingAmount) ||
      storedPaymentAmount <= 0 ||
      bookingAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    /*
     * Payment amount must exactly match
     * the booking amount stored in our database.
     */
    if (
      Math.round(storedPaymentAmount * 100) !==
      Math.round(bookingAmount * 100)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match booking amount",
      });
    }

    /*
     * Verify Razorpay signature.
     *
     * IMPORTANT:
     * The order ID comes from our database,
     * not from an arbitrary client value.
     */
    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${payment.provider_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    /*
     * Save the Razorpay payment ID.
     *
     * We intentionally use "authorized" here.
     * Final payment capture and booking confirmation
     * are handled by the Razorpay webhook.
     */
    await client.query("BEGIN");

    const updateResult = await client.query(
      `
      UPDATE payments
      SET
        provider_payment_id = $1,
        status = CASE
          WHEN status = 'captured'
            THEN 'captured'
          ELSE 'authorized'
        END,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        booking_id,
        provider_payment_id,
        status
      `,
      [
        razorpay_payment_id,
        payment.id,
      ]
    );

    await client.query("COMMIT");

    const updatedPayment =
      updateResult.rows[0];

    return res.json({
      success: true,
      message: "Payment signature verified",
      data: {
        paymentId: updatedPayment.id,
        bookingId: updatedPayment.booking_id,
        razorpayPaymentId:
          updatedPayment.provider_payment_id,
        status: updatedPayment.status,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    next(error);
  } finally {
    client.release();
  }
};

const handleWebhook = async (
  req,
  res,
  next
) => {

    console.log("=================================");
console.log("RAZORPAY WEBHOOK RECEIVED");
console.log("Event ID:", req.headers["x-razorpay-event-id"]);
console.log("=================================");


  const client =
    await pool.connect();

  try {
    const signature =
      req.headers[
        "x-razorpay-signature"
      ];

    const eventId =
      req.headers[
        "x-razorpay-event-id"
      ];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Razorpay signature",
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Razorpay event ID",
      });
    }

    const rawBody = req.body;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_WEBHOOK_SECRET
        )
        .update(rawBody)
        .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(
          expectedSignature
        ),
        Buffer.from(signature)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid webhook signature",
      });
    }

    const payload =
      JSON.parse(
        rawBody.toString("utf8")
      );
    const event = payload;

    console.log("Webhook event:", event.event);

    const eventType =
      payload.event;

    /*
     * Prevent duplicate webhook processing.
     */
    const existingEvent =
      await client.query(
        `
        SELECT id
        FROM payment_events
        WHERE provider_event_id = $1
        LIMIT 1
        `,
        [eventId]
      );

    if (
      existingEvent.rows.length > 0
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Webhook already processed",
      });
    }

    await client.query("BEGIN");

    let paymentEntity = null;
    let payment = null;
    let notificationBookingId = null;
    let paymentAlreadyCaptured = false;

    if (
      payload.payload?.payment
        ?.entity
    ) {
      paymentEntity =
        payload.payload.payment
          .entity;
    }

    const refundEntity =
        payload.payload?.refund?.entity;

    const razorpayOrderId =
      paymentEntity?.order_id;

    const razorpayPaymentId =
      paymentEntity?.id;

    const razorpayRefundId =
  refundEntity?.id || null;

    const refundPaymentId =
  refundEntity?.payment_id || null;

    const orderEntityId =
      payload.payload?.order?.entity?.id;

    const paymentId =
      razorpayPaymentId || null;

    const orderId =
      razorpayOrderId || orderEntityId || null;

    /*
     * Find our payment record.
     */
    const paymentResult =
      await client.query(
        `
        SELECT
          id,
          booking_id,
          amount,
          currency,
          status
        FROM payments
        WHERE provider = 'razorpay'
          AND (
            provider_payment_id = $1
            OR provider_order_id = $2
          )
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [paymentId, orderId]
      );

    /*
     * Save webhook event even if we cannot
     * immediately map it.
     */
    const mappedPaymentId =
      paymentResult?.rows?.[0]
        ?.id || null;

    const paymentEventInsert = await client.query(
  `
  INSERT INTO payment_events (
    payment_id,
    provider_event_id,
    event_type,
    payload,
    processed
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    false
  )
  ON CONFLICT (provider_event_id)
  DO NOTHING
  RETURNING id
  `,
  [
    mappedPaymentId,
    eventId,
    eventType,
    JSON.stringify(payload),
  ]
);

if (paymentEventInsert.rows.length === 0) {
  await client.query("ROLLBACK");

  console.log(
    "Duplicate Razorpay webhook ignored:",
    eventId
  );

  return res.status(200).json({
    success: true,
    message: "Webhook already processed",
  });
}

    if (
      paymentResult &&
      paymentResult.rows.length > 0
    ) {
      payment = paymentResult.rows[0];


      /*
 * REFUND EVENTS
 */
if (
  eventType === "refund.created" ||
  eventType === "refund.processed" ||
  eventType === "refund.failed"
) {
  if (!refundEntity) {
    throw new Error(
      "Refund event received without refund entity"
    );
  }

  /*
   * Find our refund record using the
   * Razorpay payment ID first.
   */
  const refundResult = await client.query(
    `
    SELECT
      r.id,
      r.booking_id,
      r.payment_id,
      r.amount,
      r.status,
      r.refund_percentage,
      r.cancellation_policy_id,
      r.provider_refund_id
    FROM refunds r
    INNER JOIN payments p
      ON p.id = r.payment_id
    WHERE p.provider = 'razorpay'
      AND (
        r.provider_refund_id = $1
        OR p.provider_payment_id = $2
      )
    ORDER BY r.created_at DESC
    LIMIT 1
    FOR UPDATE OF r
    `,
    [
      razorpayRefundId,
      refundPaymentId,
    ]
  );

  if (refundResult.rows.length === 0) {
    console.warn(
      "Refund webhook could not be mapped:",
      {
        refundId: razorpayRefundId,
        paymentId: refundPaymentId,
      }
    );

    await client.query(
      `
      UPDATE payment_events
      SET processed = true
      WHERE provider_event_id = $1
      `,
      [eventId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Refund webhook received but refund record not found",
    });
  }

  const refund = refundResult.rows[0];

  /*
   * Save Razorpay refund ID if we didn't
   * already have it.
   */
  await client.query(
    `
    UPDATE refunds
    SET
      provider_refund_id =
        COALESCE(
          provider_refund_id,
          $1
        ),
      raw_response = $2,
      updated_at = NOW()
    WHERE id = $3
    `,
    [
      razorpayRefundId,
      JSON.stringify(refundEntity),
      refund.id,
    ]
  );

  /*
   * REFUND CREATED
   */
  if (eventType === "refund.created") {
    await client.query(
      `
      UPDATE refunds
      SET
        status = 'processing',
        updated_at = NOW()
      WHERE id = $1
        AND status NOT IN (
          'processed',
          'failed'
        )
      `,
      [refund.id]
    );
  }

  /*
   * REFUND PROCESSED
   */
  if (eventType === "refund.processed") {
  /*
   * Refund is now actually processed by Razorpay.
   *
   * Only now should the booking become cancelled.
   */

  const refundUpdate = await client.query(
    `
    UPDATE refunds
    SET
      status = 'processed',
      provider_refund_id =
        COALESCE(
          provider_refund_id,
          $1
        ),
      raw_response = $2,
      updated_at = NOW()
    WHERE id = $3
      AND status <> 'processed'
    RETURNING
      id,
      booking_id,
      payment_id,
      amount
    `,
    [
      razorpayRefundId,
      JSON.stringify(refundEntity),
      refund.id,
    ]
  );

  /*
   * If this refund was already marked processed,
   * do not process the state transition again.
   */
  if (refundUpdate.rows.length > 0) {
    const bookingId =
      refundUpdate.rows[0].booking_id;

    /*
     * Final booking state transition.
     */
    const bookingUpdate = await client.query(
      `
      UPDATE bookings
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = $1
        AND status = 'confirmed'
      RETURNING id
      `,
      [bookingId]
    );

    /*
     * Even if the booking was already cancelled,
     * the refund itself is still successfully processed.
     *
     * Notification service has its own duplicate protection.
     */
    notificationBookingId = bookingId;

    console.log(
      "Refund processed successfully:",
      {
        refundId: refund.id,
        bookingId,
        bookingCancelled:
          bookingUpdate.rows.length > 0,
      }
    );
  }
}

  /*
   * REFUND FAILED
   */
  if (eventType === "refund.failed") {
    await client.query(
      `
      UPDATE refunds
      SET
        status = 'failed',
        provider_refund_id =
          COALESCE(
            provider_refund_id,
            $1
          ),
        raw_response = $2,
        updated_at = NOW()
      WHERE id = $3
        AND status <> 'failed'
      `,
      [
        razorpayRefundId,
        JSON.stringify(refundEntity),
        refund.id,
      ]
    );

    /*
     * We intentionally DO NOT mark the booking
     * as successfully cancelled here.
     *
     * The refund failed, so the admin needs
     * to investigate.
     */
  }

  /*
   * Mark webhook event processed.
   */
  await client.query(
    `
    UPDATE payment_events
    SET processed = true
    WHERE provider_event_id = $1
    `,
    [eventId]
  );

  await client.query("COMMIT");

  /*
   * Send cancellation notification only
   * after refund.processed.
   */
  if (
    eventType === "refund.processed" &&
    notificationBookingId
  ) {
    try {
      const {
        sendCancellationNotifications,
      } = require("../services/notificationService");

      /*
       * Fetch the latest refund data after
       * transaction commit.
       */
      const latestRefund =
        await query(
          `
          SELECT *
          FROM refunds
          WHERE id = $1
          LIMIT 1
          `,
          [refund.id]
        );

      if (
        latestRefund.rows.length > 0
      ) {
        await sendCancellationNotifications(
          notificationBookingId,
          latestRefund.rows[0]
        );
      }
    } catch (error) {
      console.error(
        "Cancellation notification process failed:",
        error.message
      );
    }
  }

  return res.status(200).json({
    success: true,
    message: "Refund webhook processed",
  });
}

      /*
       * Payment captured
       */
      if (
        eventType ===
          "payment.captured" ||
        eventType ===
          "order.paid"
      ) {
        const paymentUpdate = await client.query(
          `
          UPDATE payments
          SET
            status = 'captured',
            updated_at = NOW()
          WHERE id = $1
            AND status <> 'captured'
          RETURNING id, booking_id
          `,
          [
            payment.id,
          ]
        );

        if (paymentUpdate.rows.length > 0) {
          const bookingId =
            paymentUpdate.rows[0].booking_id;

          await client.query(
            `
            UPDATE bookings
            SET
              status = 'confirmed',
              updated_at = NOW()
            WHERE id = $1
              AND status IN (
                'pending',
                'payment_pending'
              )
            `,
            [bookingId]
          );

          notificationBookingId = bookingId;
        } else {
          paymentAlreadyCaptured = true;
        }
      }

      /*
       * Payment failed
       */
      if (
        eventType ===
        "payment.failed"
      ) {
        await client.query(
          `
          UPDATE payments
          SET
            provider_payment_id =
              COALESCE(
                $1,
                provider_payment_id
              ),
            status = 'failed',
            updated_at = NOW()
          WHERE id = $2
          `,
          [
            paymentId,
            payment.id,
          ]
        );
      }
    }

    await client.query(
      `
      UPDATE payment_events
      SET processed = true
      WHERE provider_event_id = $1
      `,
      [eventId]
    );

    await client.query("COMMIT");

    if (paymentAlreadyCaptured) {
      console.log(
        "Payment already captured. Skipping duplicate processing."
      );

      return res.status(200).json({
        success: true,
        message: "Already processed",
      });
    }

    if (notificationBookingId) {
      try {
        await sendBookingNotifications(
          notificationBookingId
        );
      } catch (error) {
        console.error(
          "Booking notification process failed:",
          error.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};