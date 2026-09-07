const { query } = require("../config/database");

const getRefunds = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        r.id,
        r.booking_id,
        r.payment_id,
        r.provider,
        r.provider_refund_id,
        r.amount,
        r.currency,
        r.status,
        r.refund_percentage,
        r.reason,
        r.created_at,
        r.updated_at,

        b.booking_reference,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.booking_date,

        p.provider_payment_id,

        cp.name AS cancellation_policy_name

      FROM refunds r

      INNER JOIN bookings b
        ON b.id = r.booking_id

      LEFT JOIN payments p
        ON p.id = r.payment_id

      LEFT JOIN cancellation_policies cp
        ON cp.id = r.cancellation_policy_id

      ORDER BY r.created_at DESC
    `);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};


const getRefundById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        r.*,

        b.booking_reference,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.booking_date,
        b.total_amount AS booking_total_amount,

        p.provider_order_id,
        p.provider_payment_id,
        p.status AS payment_status,

        cp.name AS cancellation_policy_name,
        cp.description AS cancellation_policy_description

      FROM refunds r

      INNER JOIN bookings b
        ON b.id = r.booking_id

      LEFT JOIN payments p
        ON p.id = r.payment_id

      LEFT JOIN cancellation_policies cp
        ON cp.id = r.cancellation_policy_id

      WHERE r.id = $1

      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const reconcileRefund = async (req, res, next) => {
  const { id } = req.params;

  try {
    const refundResult = await query(
      `
      SELECT
        r.*,
        p.provider_payment_id
      FROM refunds r
      INNER JOIN payments p
        ON p.id = r.payment_id
      WHERE r.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (refundResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    const refund = refundResult.rows[0];

    /*
     * Already processed locally.
     */
    if (refund.status === "processed") {
      return res.json({
        success: true,
        message: "Refund is already processed.",
        data: {
          refundId: refund.id,
          status: refund.status,
          providerRefundId:
            refund.provider_refund_id,
        },
      });
    }

    /*
     * If we already have a Razorpay refund ID,
     * ask Razorpay for its current state.
     */
    if (refund.provider_refund_id) {
      const razorpayRefund =
        await getRazorpayRefund(
          refund.provider_refund_id
        );

      await query(
        `
        UPDATE refunds
        SET
          status = $1,
          raw_response = $2::jsonb,
          updated_at = NOW()
        WHERE id = $3
        `,
        [
          razorpayRefund.status,
          JSON.stringify(razorpayRefund),
          refund.id,
        ]
      );

      /*
       * Final state.
       */
      if (
        razorpayRefund.status ===
        "processed"
      ) {
        await query(
          `
          UPDATE bookings
          SET
            status = 'cancelled',
            updated_at = NOW()
          WHERE id = $1
            AND status = 'confirmed'
          `,
          [refund.booking_id]
        );
      }

      return res.json({
        success: true,
        message: "Refund status reconciled.",
        data: {
          refundId: refund.id,
          status: razorpayRefund.status,
          providerRefundId:
            razorpayRefund.id,
        },
      });
    }

    /*
     * No Razorpay refund ID.
     *
     * Do NOT automatically create another refund here.
     *
     * The previous request may have succeeded at
     * Razorpay but failed before our DB was updated.
     */
    return res.status(409).json({
      success: false,
      message:
        "Refund has no Razorpay refund ID. Automatic retry is disabled to prevent duplicate refunds.",
    });
  } catch (error) {
    console.error(
      "Refund reconciliation error:",
      error
    );

    next(error);
  }
};


module.exports = {
  getRefunds,
  getRefundById,
  reconcileRefund,
};