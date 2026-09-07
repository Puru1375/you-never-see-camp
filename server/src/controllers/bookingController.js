const crypto = require("crypto");
const { pool, query } = require("../config/database");
const {
  getSiteSetting,
  getBooleanSiteSetting,
} = require("../utils/siteSettings");

const generateBookingReference = () => {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `YNS-${Date.now().toString().slice(-6)}-${randomPart}`;
};

/*
|--------------------------------------------------------------------------
| GET /api/bookings/availability
|--------------------------------------------------------------------------
*/

const getAvailability = async (req, res, next) => {
  try {
    const {
      packageId,
      date,
      adults = 0,
      children = 0,
      infants = 0,
    } = req.query;

    if (!packageId || !date) {
      return res.status(400).json({
        success: false,
        message: "Package and date are required",
      });
    }

    const adultCount = Number(adults);
    const childCount = Number(children);
    const infantCount = Number(infants);

    if (
      !Number.isInteger(adultCount) ||
      !Number.isInteger(childCount) ||
      !Number.isInteger(infantCount) ||
      adultCount < 0 ||
      childCount < 0 ||
      infantCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest count",
      });
    }

    const guestCount =
      adultCount +
      childCount +
      infantCount;

    if (guestCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "At least one guest is required",
      });
    }

    const packageResult = await query(
      `
      SELECT
        id,
        name,
        max_guests,
        check_in_time
      FROM packages
      WHERE id = $1
        AND is_active = true
      LIMIT 1
      `,
      [packageId]
    );

    if (packageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const packageData = packageResult.rows[0];

    const bookingResult = await query(
      `
      SELECT
        COALESCE(
          SUM(adults + children + infants),
          0
        ) AS booked_guests,

        COALESCE(
          SUM(
            CASE
              WHEN package_id = $1
              THEN adults + children + infants
              ELSE 0
            END
          ),
          0
        ) AS package_booked_guests

      FROM bookings

      WHERE booking_date = $2
        AND status IN (
          'pending',
          'payment_pending',
          'confirmed'
        )
      `,
      [packageId, date]
    );

    const bookedGuests = Number(
      bookingResult.rows[0].booked_guests
    );

    const packageBookedGuests = Number(
      bookingResult.rows[0].package_booked_guests
    );

    const settingResult = await query(
      `
      SELECT setting_value
      FROM site_settings
      WHERE setting_key = 'daily_site_capacity'
      LIMIT 1
      `
    );

    const siteCapacity = Number(
      settingResult.rows[0]?.setting_value || 40
    );

    const remainingPackageCapacity =
      packageData.max_guests -
      packageBookedGuests;

    const remainingSiteCapacity =
      siteCapacity -
      bookedGuests;

    const available =
      guestCount <= remainingPackageCapacity &&
      guestCount <= remainingSiteCapacity;

    res.json({
      success: true,
      data: {
        available,
        requestedGuests: guestCount,
        bookedGuests,
        packageBookedGuests,
        siteCapacity,
        remainingPackageCapacity,
        remainingSiteCapacity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/bookings/quote
|--------------------------------------------------------------------------
*/

const getBookingQuote = async (req, res, next) => {
  try {
    const {
      packageId,
      adults = 0,
      children = 0,
      infants = 0,
    } = req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package is required",
      });
    }

    const packageResult = await query(
            `
            SELECT
                id,
                name,
                is_active,
                max_guests
            FROM packages
            WHERE id = $1
            `,
            [packageId]
            );

            if (packageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
            }

            const selectedPackage = packageResult.rows[0];

            if (!selectedPackage.is_active) {
            return res.status(400).json({
                success: false,
                message: "This package is currently unavailable",
            });
            }

    const adultCount = Number(adults);
    const childCount = Number(children);
    const infantCount = Number(infants);

    if (
      !Number.isInteger(adultCount) ||
      !Number.isInteger(childCount) ||
      !Number.isInteger(infantCount) ||
      adultCount < 0 ||
      childCount < 0 ||
      infantCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest count",
      });
    }

    if (
      adultCount +
        childCount +
        infantCount <=
      0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one guest is required",
      });
    }

    const pricingResult = await query(
            `
            SELECT
                guest_type,
                price
            FROM pricing_rules
            WHERE package_id = $1
                AND is_active = true
            `,
            [packageId]
            );

            const pricing = {};

            pricingResult.rows.forEach((item) => {
            pricing[item.guest_type] = Number(item.price);
            });

            // Make sure every required guest type has pricing
            if (adultCount > 0 && pricing.adult === undefined) {
            return res.status(400).json({
                success: false,
                message: "Adult pricing is not configured for this package",
            });
            }

            if (childCount > 0 && pricing.child === undefined) {
            return res.status(400).json({
                success: false,
                message: "Child pricing is not configured for this package",
            });
            }

            if (infantCount > 0 && pricing.infant === undefined) {
            return res.status(400).json({
                success: false,
                message: "Infant pricing is not configured for this package",
            });
            }

            const adultPrice =
            pricing.adult ?? 0;

            const childPrice =
            pricing.child ?? 0;

            const infantPrice =
            pricing.infant ?? 0;

            const adultTotal =
            adultCount * adultPrice;

            const childTotal =
            childCount * childPrice;

            const infantTotal =
            infantCount * infantPrice;

            const subtotal =
            adultTotal +
            childTotal +
            infantTotal;

    const taxResult = await query(
      `
      SELECT
        name,
        percentage,
        is_inclusive
      FROM tax_rules
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
      `
    );

    const taxRule = taxResult.rows[0];

    let tax = 0;

    if (
      taxRule &&
      !taxRule.is_inclusive
    ) {
      tax =
        subtotal *
        (Number(taxRule.percentage) / 100);
    }

    const total = subtotal + tax;

    res.json({
      success: true,
      data: {
        adults: adultCount,
        children: childCount,
        infants: infantCount,

        adultPrice,
        childPrice,
        infantPrice,

        adultTotal,
        childTotal,
        infantTotal,

        subtotal,
        tax,
        total,

        currency: "INR",
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/bookings
|--------------------------------------------------------------------------
*/

const createBooking = async (req, res, next) => {
  const client = await pool.connect();

  const bookingEnabled = await getBooleanSiteSetting(
  "booking_enabled",
  true
);

if (!bookingEnabled) {
  return res.status(403).json({
    success: false,
    message:
      "Online booking is currently unavailable. Please contact us directly.",
  });
}

  try {
    const {
      packageId,
      customerName,
      phone,
      email,
      bookingDate,
      adults = 0,
      children = 0,
      infants = 0,
      specialRequests = "",
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Basic validation
    |--------------------------------------------------------------------------
    */

    if (
      !packageId ||
      !customerName ||
      !phone ||
      !email ||
      !bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Package, name, phone, email and booking date are required",
      });
    }

    const adultCount = Number(adults);
    const childCount = Number(children);
    const infantCount = Number(infants);

    if (
      !Number.isInteger(adultCount) ||
      !Number.isInteger(childCount) ||
      !Number.isInteger(infantCount) ||
      adultCount < 0 ||
      childCount < 0 ||
      infantCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest count",
      });
    }

    const totalGuests =
      adultCount +
      childCount +
      infantCount;

    if (totalGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: "At least one guest is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Start transaction
    |--------------------------------------------------------------------------
    */

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | Lock this booking date
    |--------------------------------------------------------------------------
    |
    | All bookings for the same date will use the same PostgreSQL
    | transaction-level advisory lock.
    |
    */

    await client.query(
      `
      SELECT pg_advisory_xact_lock(
        hashtext($1)
      )
      `,
      [bookingDate]
    );

    /*
    |--------------------------------------------------------------------------
    | Get package
    |--------------------------------------------------------------------------
    */

    const packageResult = await client.query(
      `
      SELECT
        id,
        name,
        max_guests,
        check_in_time,
        check_out_time
      FROM packages
      WHERE id = $1
        AND is_active = true
      LIMIT 1
      `,
      [packageId]
    );

    if (packageResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const packageData =
      packageResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Lead time
    |--------------------------------------------------------------------------
    */

    const minimumLeadHours = Number(
      await getSiteSetting(
        "minimum_booking_lead_hours",
        "24"
      )
    );

    if (
      !Number.isFinite(minimumLeadHours) ||
      minimumLeadHours < 0
    ) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        success: false,
        message: "Invalid minimum booking lead time configuration",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate booking date
    |--------------------------------------------------------------------------
    */

    const requestedDate = new Date(
      `${bookingDate}T${packageData.check_in_time}`
    );

    if (Number.isNaN(requestedDate.getTime())) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    const minimumAllowedDate =
      new Date(
        Date.now() +
          minimumLeadHours *
            60 *
            60 *
            1000
      );

    if (
      requestedDate <
      minimumAllowedDate
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          `Bookings must be made at least ${minimumLeadHours} hours in advance`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Existing bookings
    |--------------------------------------------------------------------------
    */

    const bookingCountResult =
      await client.query(
        `
        SELECT
          COALESCE(
            SUM(adults + children + infants),
            0
          ) AS booked_guests,

          COALESCE(
            SUM(
              CASE
                WHEN package_id = $1
                THEN adults + children + infants
                ELSE 0
              END
            ),
            0
          ) AS package_booked_guests

        FROM bookings

        WHERE booking_date = $2
          AND status IN (
            'pending',
            'payment_pending',
            'confirmed'
          )
        `,
        [packageId, bookingDate]
      );

    const bookedGuests = Number(
      bookingCountResult.rows[0]
        .booked_guests
    );

    const packageBookedGuests =
      Number(
        bookingCountResult.rows[0]
          .package_booked_guests
      );

    /*
    |--------------------------------------------------------------------------
    | Site capacity
    |--------------------------------------------------------------------------
    */

    const dailyCapacityValue = await getSiteSetting(
      "daily_site_capacity",
      "40"
    );

    const dailyCapacity = Number(
      dailyCapacityValue
    );

    if (
      !Number.isInteger(dailyCapacity) ||
      dailyCapacity < 1
    ) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        success: false,
        message: "Invalid daily site capacity configuration",
      });
    }

    const remainingPackageCapacity =
      packageData.max_guests -
      packageBookedGuests;

    const remainingSiteCapacity =
      dailyCapacity -
      bookedGuests;

    /*
    |--------------------------------------------------------------------------
    | Capacity validation
    |--------------------------------------------------------------------------
    */

    if (
      totalGuests >
      remainingPackageCapacity
    ) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          "Not enough availability for this package",
        data: {
          remainingPackageCapacity,
        },
      });
    }

    if (
      totalGuests >
      remainingSiteCapacity
    ) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          `Only ${
            dailyCapacity - bookedGuests
          } guest spots are available for this date.`,
        data: {
          remainingSiteCapacity,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get pricing
    |--------------------------------------------------------------------------
    */

    const pricingResult =
      await client.query(
        `
        SELECT
          guest_type,
          price
        FROM pricing_rules
        WHERE package_id = $1
          AND is_active = true
        `,
        [packageId]
      );

    const pricing = {};

    pricingResult.rows.forEach(
      (item) => {
        pricing[item.guest_type] =
          Number(item.price);
      }
    );

    const adultPrice =
    pricing.adult ?? 0;

    const childPrice =
    pricing.child ?? 0;

    const infantPrice =
    pricing.infant ?? 0;

    // Validate pricing only for guest types being booked
    if (
    adultCount > 0 &&
    pricing.adult === undefined
    ) {
    await client.query("ROLLBACK");

    return res.status(400).json({
        success: false,
        message:
        "Adult pricing is not configured for this package",
    });
    }

    if (
    childCount > 0 &&
    pricing.child === undefined
    ) {
    await client.query("ROLLBACK");

    return res.status(400).json({
        success: false,
        message:
        "Child pricing is not configured for this package",
    });
    }

    if (
    infantCount > 0 &&
    pricing.infant === undefined
    ) {
    await client.query("ROLLBACK");

    return res.status(400).json({
        success: false,
        message:
        "Infant pricing is not configured for this package",
    });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate totals
    |--------------------------------------------------------------------------
    */

    const adultTotal =
      adultCount * adultPrice;

    const childTotal =
      childCount * childPrice;

    const infantTotal =
      infantCount * infantPrice;

    const subtotal =
      adultTotal +
      childTotal +
      infantTotal;

    /*
    |--------------------------------------------------------------------------
    | Tax
    |--------------------------------------------------------------------------
    */

    const taxResult =
      await client.query(
        `
        SELECT
          name,
          percentage,
          is_inclusive
        FROM tax_rules
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT 1
        `
      );

    const taxRule =
      taxResult.rows[0];

    let tax = 0;

    if (
      taxRule &&
      !taxRule.is_inclusive
    ) {
      tax =
        subtotal *
        (Number(taxRule.percentage) / 100);
    }

    const total =Number(
  (subtotal + tax).toFixed(2)
);

    /*
    |--------------------------------------------------------------------------
    | Create booking
    |--------------------------------------------------------------------------
    */

    const bookingReference =
      generateBookingReference();

    const bookingResult =
      await client.query(
        `
        INSERT INTO bookings (
  booking_reference,
  package_id,
  customer_name,
  customer_phone,
  customer_email,
  booking_date,
  special_requests,
  adults,
  children,
  infants,
  subtotal,
  tax_amount,
  discount_amount,
  total_amount,
  currency,
  status
)   
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          'INR',
          'payment_pending'
        )
        RETURNING *
        `,
        [
          bookingReference,
          packageId,
          customerName.trim(),
          phone.trim(),
          email.trim().toLowerCase(),
          bookingDate,
          specialRequests.trim(),
          adultCount,
          childCount,
          infantCount,
          subtotal,
          tax,
          0,
          total,
        ]
      );

    const booking =
      bookingResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Guest breakdown
    |--------------------------------------------------------------------------
    */

    const guestRows = [
      {
        type: "adult",
        quantity: adultCount,
        price: adultPrice,
        total: adultTotal,
      },
      {
        type: "child",
        quantity: childCount,
        price: childPrice,
        total: childTotal,
      },
      {
        type: "infant",
        quantity: infantCount,
        price: infantPrice,
        total: infantTotal,
      },
    ];

    for (const guest of guestRows) {
      if (guest.quantity <= 0) {
        continue;
      }

      await client.query(
        `
        INSERT INTO booking_guests (
          booking_id,
          guest_type,
          quantity,
          unit_price,
          total_price
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          booking.id,
          guest.type,
          guest.quantity,
          guest.price,
          guest.total,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Price breakdown
    |--------------------------------------------------------------------------
    */

    const breakdownRows = [
      {
        label: `Adults (${adultCount})`,
        amount: adultTotal,
        type: "subtotal",
      },
      {
        label: `Children (${childCount})`,
        amount: childTotal,
        type: "subtotal",
      },
      {
        label: `Infants (${infantCount})`,
        amount: infantTotal,
        type: "subtotal",
      },
    ];

    if (tax > 0) {
      breakdownRows.push({
        label: taxRule?.name || "GST",
        amount: tax,
        type: "tax",
      });
    }

    for (
      let index = 0;
      index < breakdownRows.length;
      index++
    ) {
      const item =
        breakdownRows[index];

      await client.query(
        `
        INSERT INTO booking_price_breakdowns (
          booking_id,
          label,
          amount,
          type,
          sort_order
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          booking.id,
          item.label,
          item.amount,
          item.type,
          index,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      data: {
  bookingId: booking.id,
  bookingReference: booking.booking_reference,
  packageId: booking.package_id,
  customerName: booking.customer_name,
  phone: booking.customer_phone,
  email: booking.customer_email,
  bookingDate: booking.booking_date,
  adults: adultCount,
  children: childCount,
  infants: infantCount,
  subtotal: Number(booking.subtotal),
  tax: Number(booking.tax_amount),
  discount: Number(booking.discount_amount),
  total: Number(booking.total_amount),
  currency: booking.currency,
  status: booking.status,
}
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

const getBookingByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const result = await query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.booking_date,
        b.special_requests,
        b.adults,
        b.children,
        b.infants,
        b.subtotal,
        b.tax_amount,
        b.discount_amount,
        b.total_amount,
        b.currency,
        b.status,
        b.created_at,

        p.name AS package_name,
        p.slug AS package_slug,
        p.duration,
        p.accommodation,
        p.check_in_time,
        p.check_out_time

      FROM bookings b
      INNER JOIN packages p
        ON p.id = b.package_id

      WHERE b.booking_reference = $1
      LIMIT 1
      `,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    res.json({
      success: true,
      data: {
        ...booking,
        subtotal: Number(booking.subtotal),
        tax_amount: Number(booking.tax_amount),
        discount_amount: Number(booking.discount_amount),
        total_amount: Number(booking.total_amount),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  getBookingQuote,
  createBooking,
  getBookingByReference,
};