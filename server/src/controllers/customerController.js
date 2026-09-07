const { query } = require("../config/database");

const getCurrentCustomer = async (req, res) => {
  try {
    const customerResult = await query(
      `
      SELECT
        customer_name,
        customer_email,
        customer_phone
      FROM bookings
      WHERE LOWER(customer_email) = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [req.customer.contactValue]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customerResult.rows[0];

    return res.json({
      success: true,
      customer: {
        name: customer.customer_name,
        email: customer.customer_email,
        phone: customer.customer_phone,
      },
    });
  } catch (error) {
    console.error(
      "Get current customer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load customer information",
    });
  }
};


const getCustomerBookings = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.booking_date,
        b.adults,
        b.children,
        b.infants,
        b.subtotal AS subtotal_amount,
        b.tax_amount,
        b.discount_amount,
        b.total_amount,
        b.status,
        b.special_requests,
        b.created_at,

        p.id AS package_id,
        p.name AS package_name,
        p.slug AS package_slug,

        pay.status AS payment_status,
        pay.provider_order_id,
        pay.provider_payment_id

      FROM bookings b

      INNER JOIN packages p
        ON p.id = b.package_id

      LEFT JOIN payments pay
        ON pay.id = (
          SELECT p2.id
          FROM payments p2
          WHERE p2.booking_id = b.id
          ORDER BY p2.created_at DESC
          LIMIT 1
        )

      WHERE LOWER(b.customer_email) = $1

      ORDER BY
        b.booking_date DESC,
        b.created_at DESC
      `,
      [req.customer.contactValue]
    );

    const bookings = result.rows.map(
      (booking) => ({
        id: booking.id,

        bookingReference:
          booking.booking_reference,

        customerName:
          booking.customer_name,

        bookingDate:
          booking.booking_date,

        guests: {
          adults: booking.adults,
          children: booking.children,
          infants: booking.infants,
          total:
            Number(booking.adults || 0) +
            Number(booking.children || 0) +
            Number(booking.infants || 0),
        },

        package: {
          id: booking.package_id,
          name: booking.package_name,
          slug: booking.package_slug,
        },

        pricing: {
          subtotal:
            booking.subtotal_amount,
          tax:
            booking.tax_amount,
          discount:
            booking.discount_amount,
          total:
            booking.total_amount,
        },

        status:
          booking.status,

        payment: {
          status:
            booking.payment_status || "not_created",
          orderId:
            booking.provider_order_id || null,
          paymentId:
            booking.provider_payment_id || null,
        },

        specialRequests:
          booking.special_requests,

        createdAt:
          booking.created_at,
      })
    );

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get customer bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load bookings",
    });
  }
};

const getCustomerBookingByReference = async (req, res) => {
  try {
    const { bookingReference } = req.params;

    if (!bookingReference) {
      return res.status(400).json({
        success: false,
        message: "Booking reference is required",
      });
    }

    const result = await query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.customer_name,
        b.customer_email,
        b.customer_phone,

        b.booking_date,

        b.adults,
        b.children,
        b.infants,

        b.subtotal AS subtotal_amount,
        b.tax_amount,
        b.discount_amount,
        b.total_amount,

        b.status,
        b.special_requests,

        b.created_at,
        b.updated_at,

        p.id AS package_id,
        p.name AS package_name,
        p.slug AS package_slug,
        p.description AS package_description,
        p.max_guests,

        p.check_in_time,
        p.check_out_time

      FROM bookings b

      INNER JOIN packages p
        ON p.id = b.package_id

      WHERE b.booking_reference = $1
        AND LOWER(b.customer_email) = $2

      LIMIT 1
      `,
      [
        bookingReference.trim(),
        req.customer.contactValue,
      ]
    );

    /*
     * Do not reveal whether the booking exists
     * for another customer.
     */
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    /*
     * Get guests attached to this booking.
     */
    const guestsResult = await query(
      `
      SELECT
        id,
        guest_type,
        quantity,
        unit_price,
        total_price
      FROM booking_guests
      WHERE booking_id = $1
      ORDER BY guest_type ASC
      `,
      [booking.id]
    );

    /*
     * Get complete price breakdown.
     */
    const breakdownResult = await query(
      `
      SELECT
        id,
        label,
        amount,
        type,
        sort_order
      FROM booking_price_breakdowns
      WHERE booking_id = $1
      ORDER BY sort_order ASC
      `,
      [booking.id]
    );

    /*
     * Get payment information.
     *
     * Never expose provider response/raw payment data.
     */
    const paymentResult = await query(
      `
      SELECT
        id,
        provider_order_id,
        provider_payment_id,
        amount,
        currency,
        status,
        created_at,
        updated_at
      FROM payments
      WHERE booking_id = $1
      ORDER BY created_at DESC
      `,
      [booking.id]
    );

    /*
     * Get refund information if available.
     */
    const refundResult = await query(
      `
      SELECT
        id,
        amount,
        status,
        reason,
        created_at,
        updated_at
      FROM refunds
      WHERE booking_id = $1
      ORDER BY created_at DESC
      `,
      [booking.id]
    );

    const response = {
      id: booking.id,

      bookingReference:
        booking.booking_reference,

      customer: {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
      },

      booking: {
        date: booking.booking_date,

        guests: {
          adults: Number(booking.adults || 0),
          children: Number(booking.children || 0),
          infants: Number(booking.infants || 0),
          total:
            Number(booking.adults || 0) +
            Number(booking.children || 0) +
            Number(booking.infants || 0),
        },

        status: booking.status,

        specialRequests:
          booking.special_requests,

        createdAt:
          booking.created_at,

        updatedAt:
          booking.updated_at,
      },

      package: {
        id: booking.package_id,
        name: booking.package_name,
        slug: booking.package_slug,
        description:
          booking.package_description,
        maxGuests:
          booking.max_guests,
        checkInTime:
          booking.check_in_time,
        checkOutTime:
          booking.check_out_time,
      },

      pricing: {
        subtotal:
          booking.subtotal_amount,

        tax:
          booking.tax_amount,

        discount:
          booking.discount_amount,

        total:
          booking.total_amount,
      },

      guests: guestsResult.rows.map(
        (guest) => ({
          id: guest.id,
          type: guest.guest_type,
          quantity: Number(guest.quantity),
          unitPrice: Number(guest.unit_price),
          totalPrice: Number(guest.total_price),
        })
      ),

      priceBreakdown:
        breakdownResult.rows.map(
          (item) => ({
            id: item.id,
            label: item.label,
            type: item.type,
            sortOrder: item.sort_order,
            amount: Number(item.amount),
          })
        ),

      payments:
        paymentResult.rows.map(
          (payment) => ({
            id: payment.id,

            orderId:
              payment.provider_order_id,

            paymentId:
              payment.provider_payment_id,

            amount:
              payment.amount,

            currency:
              payment.currency,

            status:
              payment.status,

            createdAt:
              payment.created_at,

            updatedAt:
              payment.updated_at,
          })
        ),

      refunds:
        refundResult.rows.map(
          (refund) => ({
            id: refund.id,

            amount:
              refund.amount,

            status:
              refund.status,

            reason:
              refund.reason,

            createdAt:
              refund.created_at,

            updatedAt:
              refund.updated_at,
          })
        ),
    };

    return res.json({
      success: true,
      booking: response,
    });
  } catch (error) {
    console.error(
      "Get customer booking details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load booking details",
    });
  }
};


module.exports = {
  getCurrentCustomer,
  getCustomerBookings,
    getCustomerBookingByReference,
};