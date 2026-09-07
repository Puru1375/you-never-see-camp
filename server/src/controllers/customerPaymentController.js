const { query } = require("../config/database");
const { createPaymentOrder } = require("./paymentController");


const getCustomerBookingPayment = async (req, res) => {
  try {
    const { bookingReference } = req.params;

    const result = await query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.customer_email,
        b.status,
        b.total_amount,

        p.id AS payment_id,
        p.provider_order_id,
        p.provider_payment_id,
        p.amount AS payment_amount,
        p.currency,
        p.status AS payment_status,
        p.created_at AS payment_created_at,
        p.updated_at AS payment_updated_at

      FROM bookings b

      LEFT JOIN payments p
        ON p.id = (
          SELECT p2.id
          FROM payments p2
          WHERE p2.booking_id = b.id
          ORDER BY p2.created_at DESC
          LIMIT 1
        )

      WHERE b.booking_reference = $1
        AND LOWER(b.customer_email) = $2

      LIMIT 1
      `,
      [
        bookingReference.trim(),
        req.customer.contactValue,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    return res.json({
      success: true,

      payment: {
        bookingReference:
          booking.booking_reference,

        bookingStatus:
          booking.status,

        bookingTotal:
          booking.total_amount,

        payment: booking.payment_id
          ? {
              id: booking.payment_id,

              orderId:
                booking.provider_order_id,

              paymentId:
                booking.provider_payment_id,

              amount:
                booking.payment_amount,

              currency:
                booking.currency,

              status:
                booking.payment_status,

              createdAt:
                booking.payment_created_at,

              updatedAt:
                booking.payment_updated_at,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Get customer payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load payment information",
    });
  }
};


const createCustomerPaymentOrder = async (req, res, next) => {
  try {
    const { bookingReference } = req.params;

    /*
     * Customer must already be authenticated.
     */
    if (!req.customer) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required",
      });
    }

    /*
     * Find booking using BOTH:
     *
     * 1. booking reference
     * 2. authenticated customer email
     *
     * The customer cannot provide an arbitrary booking ID.
     */
    const bookingResult = await query(
      `
      SELECT
        id,
        booking_reference,
        customer_email,
        status,
        total_amount
      FROM bookings
      WHERE booking_reference = $1
        AND LOWER(customer_email) = $2
      LIMIT 1
      `,
      [
        bookingReference.trim(),
        req.customer.contactValue,
      ]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    /*
     * Customer payment retry is ONLY for
     * payment_pending bookings.
     *
     * Initial "pending" payment is handled
     * by the normal booking flow.
     */
    if (booking.status !== "payment_pending") {
      return res.status(400).json({
        success: false,
        message:
          "Payment retry is not available for this booking",
      });
    }

    /*
     * Pass ONLY the verified database booking ID
     * to the existing Razorpay payment controller.
     */
    req.body = {
      bookingId: booking.id,
    };

    return createPaymentOrder(
      req,
      res,
      next
    );
  } catch (error) {
    console.error(
      "Create customer payment order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create payment order",
    });
  }
};

const crypto = require("crypto");

const verifyCustomerPayment = async (req, res, next) => {
  try {
    const { bookingReference } = req.params;

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
        message:
          "Payment verification data is incomplete",
      });
    }

    /*
     * Verify that the booking belongs to
     * the authenticated customer.
     */
    const bookingResult = await query(
      `
      SELECT
        id,
        booking_reference,
        customer_email,
        total_amount,
        currency,
        status
      FROM bookings
      WHERE booking_reference = $1
        AND LOWER(customer_email) = $2
      LIMIT 1
      `,
      [
        bookingReference.trim(),
        req.customer.contactValue,
      ]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    /*
     * Find the Razorpay payment order.
     *
     * We require BOTH:
     * - Razorpay order ID
     * - our customer's booking
     */
    const paymentResult = await query(
      `
      SELECT
        p.id,
        p.booking_id,
        p.provider_order_id,
        p.provider_payment_id,
        p.amount,
        p.currency,
        p.status
      FROM payments p
      WHERE p.provider = 'razorpay'
        AND p.provider_order_id = $1
        AND p.booking_id = $2
      LIMIT 1
      `,
      [
        razorpay_order_id,
        booking.id,
      ]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    const payment = paymentResult.rows[0];

    /*
     * Make sure the payment amount matches
     * the booking amount.
     */
    const storedPaymentAmount =
      Number(payment.amount);

    const bookingAmount =
      Number(booking.total_amount);

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
     * Currency must also match.
     */
    if (
      payment.currency !== booking.currency
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment currency does not match booking currency",
      });
    }

    /*
     * Verify Razorpay signature.
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

    const signatureMatches =
      generatedSignature.length ===
        razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signatureMatches) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    /*
     * Save payment ID.
     *
     * IMPORTANT:
     * Do NOT confirm the booking here.
     *
     * The Razorpay webhook remains the source
     * of truth for final payment capture.
     */
    const updateResult = await query(
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

    if (updateResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to update payment",
      });
    }

    const updatedPayment =
      updateResult.rows[0];

    return res.json({
      success: true,

      message:
        "Payment signature verified",

      data: {
        paymentId:
          updatedPayment.id,

        bookingId:
          updatedPayment.booking_id,

        razorpayPaymentId:
          updatedPayment.provider_payment_id,

        status:
          updatedPayment.status,
      },
    });
  } catch (error) {
    console.error(
      "Customer payment verification error:",
      error
    );

    return next(error);
  }
};


module.exports = {
  getCustomerBookingPayment,
  createCustomerPaymentOrder,
  verifyCustomerPayment,
};