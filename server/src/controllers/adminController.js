const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active
      FROM admins
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email.trim()]
    );

    const admin = result.rows[0];

    if (!admin || !admin.is_active) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentAdmin = async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        name,
        email,
        role,
        is_active
      FROM admins
      WHERE id = $1
      LIMIT 1
      `,
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const summaryResult = await query(`
      SELECT
        COUNT(*)::INTEGER AS total_bookings,

        COUNT(*) FILTER (
          WHERE status = 'confirmed'
        )::INTEGER AS confirmed_bookings,

        COUNT(*) FILTER (
          WHERE status = 'payment_pending'
        )::INTEGER AS pending_payments,

        COUNT(*) FILTER (
          WHERE status = 'cancelled'
        )::INTEGER AS cancelled_bookings,

        COUNT(*) FILTER (
          WHERE booking_date = CURRENT_DATE
        )::INTEGER AS today_bookings,

        COUNT(*) FILTER (
          WHERE booking_date >= CURRENT_DATE
            AND status IN ('confirmed', 'payment_pending')
        )::INTEGER AS upcoming_bookings

      FROM bookings
    `);

    const revenueResult = await query(`
      SELECT
        COALESCE(
          SUM(amount),
          0
        )::NUMERIC(12,2) AS total_revenue
      FROM payments
      WHERE provider = 'razorpay'
        AND status = 'captured'
    `);

    const recentBookingsResult = await query(`
      SELECT
        b.id,
        b.booking_reference,
        b.customer_name,
        b.customer_phone,
        b.booking_date,
        b.adults,
        b.children,
        b.infants,
        b.total_amount,
        b.currency,
        b.status,
        b.created_at,

        p.name AS package_name

      FROM bookings b

      INNER JOIN packages p
        ON p.id = b.package_id

      ORDER BY b.created_at DESC

      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        summary: {
          ...summaryResult.rows[0],
          total_revenue: Number(
            revenueResult.rows[0].total_revenue
          ),
        },

        recentBookings: recentBookingsResult.rows.map(
          (booking) => ({
            ...booking,
            total_amount: Number(
              booking.total_amount
            ),
          })
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBookings = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      packageId = "",
      date = "",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          b.booking_reference ILIKE $${values.length}
          OR b.customer_name ILIKE $${values.length}
          OR b.customer_phone ILIKE $${values.length}
          OR COALESCE(b.customer_email, '') ILIKE $${values.length}
        )
      `);
    }

    if (status) {
      values.push(status);

      conditions.push(
        `b.status = $${values.length}`
      );
    }

    if (packageId) {
      values.push(packageId);

      conditions.push(
        `b.package_id = $${values.length}`
      );
    }

    if (date) {
      values.push(date);

      conditions.push(
        `b.booking_date = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countResult = await query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM bookings b
      ${whereClause}
      `,
      values
    );

    const total = countResult.rows[0].total;

    const bookingsValues = [...values];

    bookingsValues.push(limitNumber);
    const limitPosition = bookingsValues.length;

    bookingsValues.push(offset);
    const offsetPosition = bookingsValues.length;

    const result = await query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.booking_date,
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
        b.updated_at,

        p.id AS package_id,
        p.name AS package_name,
        p.slug AS package_slug

      FROM bookings b

      INNER JOIN packages p
        ON p.id = b.package_id

      ${whereClause}

      ORDER BY
        b.booking_date DESC,
        b.created_at DESC

      LIMIT $${limitPosition}
      OFFSET $${offsetPosition}
      `,
      bookingsValues
    );

    res.json({
      success: true,
      data: {
        bookings: result.rows.map((booking) => ({
          ...booking,
          subtotal: Number(booking.subtotal),
          tax_amount: Number(booking.tax_amount),
          discount_amount: Number(
            booking.discount_amount
          ),
          total_amount: Number(
            booking.total_amount
          ),
        })),

        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookingResult = await query(
      `
      SELECT
        b.*,

        p.name AS package_name,
        p.slug AS package_slug,
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
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

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
      ORDER BY guest_type
      `,
      [id]
    );

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
      [id]
    );

    const paymentsResult = await query(
      `
      SELECT
        id,
        provider,
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
      [id]
    );

    const notificationsResult = await query(
      `
      SELECT
        id,
        channel,
        recipient,
        subject,
        status,
        provider_message_id,
        error_message,
        sent_at,
        created_at
      FROM notifications
      WHERE booking_id = $1
      ORDER BY created_at DESC
      `,
      [id]
    );

    res.json({
      success: true,
      data: {
        booking: {
          ...booking,
          subtotal: Number(booking.subtotal),
          tax_amount: Number(booking.tax_amount),
          discount_amount: Number(
            booking.discount_amount
          ),
          total_amount: Number(
            booking.total_amount
          ),
        },

        guests: guestsResult.rows.map((guest) => ({
          ...guest,
          unit_price: Number(guest.unit_price),
          total_price: Number(
            guest.total_price
          ),
        })),

        breakdown: breakdownResult.rows.map(
          (item) => ({
            ...item,
            amount: Number(item.amount),
          })
        ),

        payments: paymentsResult.rows.map(
          (payment) => ({
            ...payment,
            amount: Number(payment.amount),
          })
        ),

        notifications:
          notificationsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const status =
      req.body?.status || req.query.status;

    const allowedStatuses = [
      "cancelled",
      "completed",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Booking status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const result = await query(
      `
      UPDATE bookings
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json({
      success: true,
      message: `Booking marked as ${status}`,
      data: {
        booking: result.rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Admin booking status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

// ============================================================
// ADMIN PACKAGE MANAGEMENT
// ============================================================

const getAdminPackages = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id,
        p.slug,
        p.name,
        p.tagline,
        p.description,
        p.base_price,
        p.price_label,
        p.duration,
        p.accommodation,
        p.max_guests,
        p.check_in_time,
        p.check_out_time,
        p.featured,
        p.is_active,
        p.created_at,
        p.updated_at,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pm.id,
                'name', pm.name,
                'sort_order', pm.sort_order
              )
              ORDER BY pm.sort_order
            )
            FROM package_meals pm
            WHERE pm.package_id = p.id
          ),
          '[]'::json
        ) AS meals,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pa.id,
                'name', pa.name,
                'sort_order', pa.sort_order
              )
              ORDER BY pa.sort_order
            )
            FROM package_activities pa
            WHERE pa.package_id = p.id
          ),
          '[]'::json
        ) AS activities

      FROM packages p
      ORDER BY p.created_at DESC
    `);

    return res.json({
      success: true,
      data: {
        packages: result.rows,
      },
    });
  } catch (error) {
    console.error("Get admin packages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
    });
  }
};


const getAdminPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const packageResult = await query(
      `
      SELECT
        id,
        slug,
        name,
        tagline,
        description,
        base_price,
        price_label,
        duration,
        accommodation,
        max_guests,
        check_in_time,
        check_out_time,
        featured,
        is_active,
        created_at,
        updated_at
      FROM packages
      WHERE id = $1
      `,
      [id]
    );

    if (packageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const mealsResult = await query(
      `
      SELECT
        id,
        package_id,
        name,
        sort_order
      FROM package_meals
      WHERE package_id = $1
      ORDER BY sort_order ASC
      `,
      [id]
    );

    const activitiesResult = await query(
      `
      SELECT
        id,
        package_id,
        name,
        sort_order
      FROM package_activities
      WHERE package_id = $1
      ORDER BY sort_order ASC
      `,
      [id]
    );

    return res.json({
      success: true,
      data: {
        package: packageResult.rows[0],
        meals: mealsResult.rows,
        activities: activitiesResult.rows,
      },
    });
  } catch (error) {
    console.error("Get admin package error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch package",
    });
  }
};


const createAdminPackage = async (req, res) => {
  try {
    const {
      slug,
      name,
      tagline,
      description,
      base_price,
      price_label,
      duration,
      accommodation,
      max_guests,
      check_in_time,
      check_out_time,
      featured,
      is_active,
      meals = [],
      activities = [],
    } = req.body || {};

    if (!slug || !name) {
      return res.status(400).json({
        success: false,
        message: "Slug and package name are required",
      });
    }

    if (
      !Array.isArray(meals) ||
      !Array.isArray(activities)
    ) {
      return res.status(400).json({
        success: false,
        message: "Meals and activities must be arrays",
      });
    }

    const existing = await query(
      `
      SELECT id
      FROM packages
      WHERE slug = $1
      `,
      [slug]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A package with this slug already exists",
      });
    }

    const packageResult = await query(
      `
      INSERT INTO packages (
        slug,
        name,
        tagline,
        description,
        base_price,
        price_label,
        duration,
        accommodation,
        max_guests,
        check_in_time,
        check_out_time,
        featured,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING *
      `,
      [
        slug,
        name,
        tagline || null,
        description || null,
        Number(base_price || 0),
        price_label || "per guest",
        duration || null,
        accommodation || null,
        Number(max_guests || 1),
        check_in_time || null,
        check_out_time || null,
        Boolean(featured),
        is_active !== false,
      ]
    );

    const newPackage = packageResult.rows[0];

    for (let i = 0; i < meals.length; i++) {
      const mealName =
        typeof meals[i] === "string"
          ? meals[i]
          : meals[i]?.name;

      if (!mealName?.trim()) continue;

      await query(
        `
        INSERT INTO package_meals (
          package_id,
          name,
          sort_order
        )
        VALUES ($1, $2, $3)
        `,
        [newPackage.id, mealName.trim(), i]
      );
    }

    for (let i = 0; i < activities.length; i++) {
      const activityName =
        typeof activities[i] === "string"
          ? activities[i]
          : activities[i]?.name;

      if (!activityName?.trim()) continue;

      await query(
        `
        INSERT INTO package_activities (
          package_id,
          name,
          sort_order
        )
        VALUES ($1, $2, $3)
        `,
        [newPackage.id, activityName.trim(), i]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: {
        package: newPackage,
      },
    });
  } catch (error) {
    console.error("Create admin package error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create package",
    });
  }
};


const updateAdminPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      slug,
      name,
      tagline,
      description,
      base_price,
      price_label,
      duration,
      accommodation,
      max_guests,
      check_in_time,
      check_out_time,
      featured,
      is_active,
      meals = [],
      activities = [],
    } = req.body || {};

    if (!slug || !name) {
      return res.status(400).json({
        success: false,
        message: "Slug and package name are required",
      });
    }

    if (
      !Array.isArray(meals) ||
      !Array.isArray(activities)
    ) {
      return res.status(400).json({
        success: false,
        message: "Meals and activities must be arrays",
      });
    }

    const existing = await query(
      `
      SELECT id
      FROM packages
      WHERE id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const duplicateSlug = await query(
      `
      SELECT id
      FROM packages
      WHERE slug = $1
        AND id <> $2
      `,
      [slug, id]
    );

    if (duplicateSlug.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another package already uses this slug",
      });
    }

    const packageResult = await query(
      `
      UPDATE packages
      SET
        slug = $1,
        name = $2,
        tagline = $3,
        description = $4,
        base_price = $5,
        price_label = $6,
        duration = $7,
        accommodation = $8,
        max_guests = $9,
        check_in_time = $10,
        check_out_time = $11,
        featured = $12,
        is_active = $13,
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
      `,
      [
        slug,
        name,
        tagline || null,
        description || null,
        Number(base_price || 0),
        price_label || "per guest",
        duration || null,
        accommodation || null,
        Number(max_guests || 1),
        check_in_time || null,
        check_out_time || null,
        Boolean(featured),
        is_active !== false,
        id,
      ]
    );

    // Replace meals
    await query(
      `
      DELETE FROM package_meals
      WHERE package_id = $1
      `,
      [id]
    );

    for (let i = 0; i < meals.length; i++) {
      const mealName =
        typeof meals[i] === "string"
          ? meals[i]
          : meals[i]?.name;

      if (!mealName?.trim()) continue;

      await query(
        `
        INSERT INTO package_meals (
          package_id,
          name,
          sort_order
        )
        VALUES ($1, $2, $3)
        `,
        [id, mealName.trim(), i]
      );
    }

    // Replace activities
    await query(
      `
      DELETE FROM package_activities
      WHERE package_id = $1
      `,
      [id]
    );

    for (let i = 0; i < activities.length; i++) {
      const activityName =
        typeof activities[i] === "string"
          ? activities[i]
          : activities[i]?.name;

      if (!activityName?.trim()) continue;

      await query(
        `
        INSERT INTO package_activities (
          package_id,
          name,
          sort_order
        )
        VALUES ($1, $2, $3)
        `,
        [id, activityName.trim(), i]
      );
    }

    return res.json({
      success: true,
      message: "Package updated successfully",
      data: {
        package: packageResult.rows[0],
      },
    });
  } catch (error) {
    console.error("Update admin package error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update package",
    });
  }
};


const updateAdminPackageStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { is_active } = req.body || {};

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false",
      });
    }

    const result = await query(
      `
      UPDATE packages
      SET
        is_active = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.json({
      success: true,
      message: is_active
        ? "Package activated"
        : "Package deactivated",
      data: {
        package: result.rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Update admin package status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update package status",
    });
  }
};

// =========================
// PRICING MANAGEMENT
// =========================

const getAdminPricingRules = async (req, res) => {
  try {
    const { packageId, guestType, active } = req.query;

    const values = [];
    const conditions = [];

    if (packageId) {
      values.push(packageId);
      conditions.push(`pr.package_id = $${values.length}`);
    }

    if (guestType) {
      values.push(guestType);
      conditions.push(`pr.guest_type = $${values.length}`);
    }

    if (active !== undefined) {
      values.push(active === "true");
      conditions.push(`pr.is_active = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await query(
      `
      SELECT
        pr.id,
        pr.package_id,
        p.name AS package_name,
        p.slug AS package_slug,
        pr.guest_type,
        pr.price,
        pr.min_age,
        pr.max_age,
        pr.is_active,
        pr.created_at
      FROM pricing_rules pr
      JOIN packages p ON p.id = pr.package_id
      ${whereClause}
      ORDER BY p.name ASC,
               CASE pr.guest_type
                 WHEN 'adult' THEN 1
                 WHEN 'child' THEN 2
                 WHEN 'infant' THEN 3
               END
      `,
      values
    );

    res.json({
      success: true,
      data: {
        pricingRules: result.rows,
      },
    });
  } catch (error) {
    console.error("Get admin pricing rules error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing rules",
    });
  }
};


const getAdminPricingRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        pr.id,
        pr.package_id,
        p.name AS package_name,
        p.slug AS package_slug,
        pr.guest_type,
        pr.price,
        pr.min_age,
        pr.max_age,
        pr.is_active,
        pr.created_at
      FROM pricing_rules pr
      JOIN packages p ON p.id = pr.package_id
      WHERE pr.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pricing rule not found",
      });
    }

    res.json({
      success: true,
      data: {
        pricingRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Get pricing rule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing rule",
    });
  }
};


const createAdminPricingRule = async (req, res) => {
  try {
    const {
      package_id,
      guest_type,
      price,
      min_age,
      max_age,
      is_active = true,
    } = req.body || {};

    if (!package_id || !guest_type || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Package, guest type and price are required",
      });
    }

    const validGuestTypes = ["adult", "child", "infant"];

    if (!validGuestTypes.includes(guest_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest type",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (
      min_age !== undefined &&
      min_age !== null &&
      max_age !== undefined &&
      max_age !== null &&
      Number(min_age) > Number(max_age)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum age cannot be greater than maximum age",
      });
    }

    // Check package exists
    const packageResult = await query(
      `
      SELECT id
      FROM packages
      WHERE id = $1
      `,
      [package_id]
    );

    if (packageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Prevent duplicate active guest-type rule
    const duplicateResult = await query(
      `
      SELECT id
      FROM pricing_rules
      WHERE package_id = $1
        AND guest_type = $2
        AND is_active = true
      `,
      [package_id, guest_type]
    );

    if (duplicateResult.rows.length > 0 && is_active) {
      return res.status(409).json({
        success: false,
        message: `An active ${guest_type} pricing rule already exists for this package`,
      });
    }

    const result = await query(
      `
      INSERT INTO pricing_rules (
        package_id,
        guest_type,
        price,
        min_age,
        max_age,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        package_id,
        guest_type,
        price,
        min_age ?? null,
        max_age ?? null,
        is_active,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Pricing rule created successfully",
      data: {
        pricingRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Create pricing rule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create pricing rule",
    });
  }
};


const updateAdminPricingRule = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      package_id,
      guest_type,
      price,
      min_age,
      max_age,
      is_active = true,
    } = req.body || {};

    if (!package_id || !guest_type || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Package, guest type and price are required",
      });
    }

    const validGuestTypes = ["adult", "child", "infant"];

    if (!validGuestTypes.includes(guest_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest type",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (
      min_age !== undefined &&
      min_age !== null &&
      max_age !== undefined &&
      max_age !== null &&
      Number(min_age) > Number(max_age)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum age cannot be greater than maximum age",
      });
    }

    const existingResult = await query(
      `
      SELECT id
      FROM pricing_rules
      WHERE id = $1
      `,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pricing rule not found",
      });
    }

    const duplicateResult = await query(
      `
      SELECT id
      FROM pricing_rules
      WHERE package_id = $1
        AND guest_type = $2
        AND is_active = true
        AND id <> $3
      `,
      [package_id, guest_type, id]
    );

    if (duplicateResult.rows.length > 0 && is_active) {
      return res.status(409).json({
        success: false,
        message: `An active ${guest_type} pricing rule already exists for this package`,
      });
    }

    const result = await query(
      `
      UPDATE pricing_rules
      SET
        package_id = $1,
        guest_type = $2,
        price = $3,
        min_age = $4,
        max_age = $5,
        is_active = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        package_id,
        guest_type,
        price,
        min_age ?? null,
        max_age ?? null,
        is_active,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Pricing rule updated successfully",
      data: {
        pricingRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Update pricing rule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update pricing rule",
    });
  }
};


const updateAdminPricingRuleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body || {};

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean",
      });
    }

    const result = await query(
      `
      UPDATE pricing_rules
      SET is_active = $1
      WHERE id = $2
      RETURNING *
      `,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pricing rule not found",
      });
    }

    res.json({
      success: true,
      message: `Pricing rule ${
        is_active ? "activated" : "deactivated"
      } successfully`,
      data: {
        pricingRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Update pricing rule status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update pricing rule status",
    });
  }
};

// =========================
// TAX MANAGEMENT
// =========================

const getAdminTaxRules = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        name,
        percentage,
        is_inclusive,
        is_active,
        created_at
      FROM tax_rules
      ORDER BY created_at DESC
      `
    );

    res.json({
      success: true,
      data: {
        taxRules: result.rows,
      },
    });
  } catch (error) {
    console.error("Get admin tax rules error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tax rules",
    });
  }
};


const getAdminTaxRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        id,
        name,
        percentage,
        is_inclusive,
        is_active,
        created_at
      FROM tax_rules
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tax rule not found",
      });
    }

    res.json({
      success: true,
      data: {
        taxRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Get tax rule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tax rule",
    });
  }
};


const createAdminTaxRule = async (req, res) => {
  try {
    const {
      name,
      percentage,
      is_inclusive = false,
      is_active = true,
    } = req.body || {};

    if (!name || percentage === undefined) {
      return res.status(400).json({
        success: false,
        message: "Tax name and percentage are required",
      });
    }

    const taxPercentage = Number(percentage);

    if (
      !Number.isFinite(taxPercentage) ||
      taxPercentage < 0 ||
      taxPercentage > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tax percentage must be between 0 and 100",
      });
    }

    if (typeof is_inclusive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_inclusive must be a boolean",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean",
      });
    }

    /*
     * Only one active tax rule should be used
     * by the booking engine.
     */
    if (is_active) {
      await query(
        `
        UPDATE tax_rules
        SET is_active = false
        WHERE is_active = true
        `
      );
    }

    const result = await query(
      `
      INSERT INTO tax_rules (
        name,
        percentage,
        is_inclusive,
        is_active
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name.trim(),
        taxPercentage,
        is_inclusive,
        is_active,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Tax rule created successfully",
      data: {
        taxRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Create tax rule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create tax rule",
    });
  }
};


const updateAdminTaxRule = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      percentage,
      is_inclusive = false,
      is_active = true,
    } = req.body || {};

    if (!name || percentage === undefined) {
      return res.status(400).json({
        success: false,
        message: "Tax name and percentage are required",
      });
    }

    const taxPercentage = Number(percentage);

    if (
      !Number.isFinite(taxPercentage) ||
      taxPercentage < 0 ||
      taxPercentage > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tax percentage must be between 0 and 100",
      });
    }

    if (typeof is_inclusive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_inclusive must be a boolean",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean",
      });
    }

    const existingResult = await query(
      `
      SELECT id
      FROM tax_rules
      WHERE id = $1
      `,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tax rule not found",
      });
    }

    /*
     * If this rule becomes active,
     * deactivate the currently active rule.
     */
    if (is_active) {
      await query(
        `
        UPDATE tax_rules
        SET is_active = false
        WHERE is_active = true
          AND id <> $1
        `,
        [id]
      );
    }

    const result = await query(
      `
      UPDATE tax_rules
      SET
        name = $1,
        percentage = $2,
        is_inclusive = $3,
        is_active = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        name.trim(),
        taxPercentage,
        is_inclusive,
        is_active,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Tax rule updated successfully",
      data: {
        taxRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Update tax rule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update tax rule",
    });
  }
};


const updateAdminTaxRuleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body || {};

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean",
      });
    }

    /*
     * Activating one tax rule automatically
     * deactivates the others.
     */
    if (is_active) {
      await query(
        `
        UPDATE tax_rules
        SET is_active = false
        WHERE is_active = true
          AND id <> $1
        `,
        [id]
      );
    }

    const result = await query(
      `
      UPDATE tax_rules
      SET is_active = $1
      WHERE id = $2
      RETURNING *
      `,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tax rule not found",
      });
    }

    res.json({
      success: true,
      message: `Tax rule ${
        is_active ? "activated" : "deactivated"
      } successfully`,
      data: {
        taxRule: result.rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Update tax rule status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update tax rule status",
    });
  }
};

const getAdminSettings = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        id,
        setting_key,
        setting_value,
        updated_at
      FROM site_settings
      ORDER BY setting_key ASC
    `);

    return res.json({
      success: true,
      data: {
        settings: result.rows,
      },
    });
  } catch (error) {
    console.error("Get admin settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};


const updateAdminSetting = async (req, res) => {
  try {
    const settingKey = req.params.settingKey?.trim();
    const { settingValue } = req.body || {};

    const allowedSettings = {
      business_name: "string",
      daily_site_capacity: {
    type: "number",
    min: 1,
    max: 10000,
  },

  minimum_booking_lead_hours: {
    type: "number",
    min: 0,
    max: 720,
  },

  payment_pending_expiry_minutes: {
    type: "number",
    min: 5,
    max: 1440,
  },

  booking_cancellation_hours: {
    type: "number",
    min: 0,
    max: 720,
  },

  default_check_in_time: {
    type: "time",
  },

  default_check_out_time: {
    type: "time",
  },

  booking_enabled: {
    type: "boolean",
  },
    };

    const settingConfig =
  allowedSettings[settingKey];

if (!settingConfig) {
  return res.status(400).json({
    success: false,
    message: "Invalid setting key.",
  });
}
if (settingConfig.type === "number") {
  const value = Number(settingValue);

  if (
    !Number.isFinite(value) ||
    value < settingConfig.min ||
    value > settingConfig.max
  ) {
    return res.status(400).json({
      success: false,
      message:
        `${settingKey} must be between ` +
        `${settingConfig.min} and ` +
        `${settingConfig.max}.`,
    });
  }
}
if (settingConfig.type === "boolean") {
  if (
    settingValue !== "true" &&
    settingValue !== "false"
  ) {
    return res.status(400).json({
      success: false,
      message:
        `${settingKey} must be true or false.`,
    });
  }
}


    if (!settingKey) {
      return res.status(400).json({
        success: false,
        message: "settingKey is required",
      });
    }

    if (settingValue === undefined || settingValue === null) {
      return res.status(400).json({
        success: false,
        message: "settingValue is required",
      });
    }

    if (!allowedSettings[settingKey]) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting key",
      });
    }

    if (allowedSettings[settingKey] === "string") {
      if (typeof settingValue !== "string") {
        return res.status(400).json({
          success: false,
          message: "Setting value must be a string",
        });
      }
    }

    if (allowedSettings[settingKey] === "number") {
      const numericValue = Number(settingValue);

      if (
        !Number.isFinite(numericValue) ||
        numericValue < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Setting value must be a valid non-negative number",
        });
      }
    }

    if (settingKey === "daily_site_capacity") {
      const value = Number(settingValue);

      if (!Number.isInteger(value) || value < 1) {
        return res.status(400).json({
          success: false,
          message: "Daily capacity must be a whole number greater than 0",
        });
      }
    }

    if (allowedSettings[settingKey] === "time") {
      if (
        typeof settingValue !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(settingValue)
      ) {
        return res.status(400).json({
          success: false,
          message: "Setting value must be a valid time in HH:MM format",
        });
      }
    }

    if (settingKey === "booking_enabled") {
      if (
        settingValue !== "true" &&
        settingValue !== "false"
      ) {
        return res.status(400).json({
          success: false,
          message: "booking_enabled must be true or false",
        });
      }
    }

    const result = await query(
      `
      INSERT INTO site_settings (
        setting_key,
        setting_value,
        updated_at
      )
      VALUES ($1, $2, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        updated_at = NOW()
      RETURNING
        id,
        setting_key,
        setting_value,
        updated_at
      `,
      [
        settingKey.trim(),
        String(settingValue),
      ]
    );

    return res.json({
      success: true,
      message: "Setting updated successfully",
      data: {
        setting: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Update admin setting error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update setting",
    });
  }
};

const getAdminCancellationPolicies = async (req, res) => {
  try {
    const { packageId, active } = req.query;

    const conditions = [];
    const values = [];

    if (packageId) {
      values.push(packageId);
      conditions.push(`cp.package_id = $${values.length}`);
    }

    if (active !== undefined) {
      values.push(active === "true");
      conditions.push(`cp.is_active = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await query(
      `
      SELECT
        cp.id,
        cp.package_id,
        cp.name,
        cp.refund_percentage,
        cp.minimum_days_before_arrival,
        cp.description,
        cp.is_active,
        cp.created_at,
        p.name AS package_name
      FROM cancellation_policies cp
      LEFT JOIN packages p
        ON p.id = cp.package_id
      ${whereClause}
      ORDER BY
        cp.minimum_days_before_arrival DESC,
        cp.created_at DESC
      `,
      values
    );

    return res.json({
      success: true,
      data: {
        policies: result.rows.map((policy) => ({
          ...policy,
          refund_percentage: Number(policy.refund_percentage),
          minimum_days_before_arrival: Number(
            policy.minimum_days_before_arrival
          ),
        })),
      },
    });
  } catch (error) {
    console.error(
      "Get admin cancellation policies error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cancellation policies",
    });
  }
};

const getAdminCancellationPolicyById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        cp.id,
        cp.package_id,
        cp.name,
        cp.refund_percentage,
        cp.minimum_days_before_arrival,
        cp.description,
        cp.is_active,
        cp.created_at,
        p.name AS package_name
      FROM cancellation_policies cp
      LEFT JOIN packages p
        ON p.id = cp.package_id
      WHERE cp.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cancellation policy not found",
      });
    }

    const policy = result.rows[0];

    return res.json({
      success: true,
      data: {
        policy: {
          ...policy,
          refund_percentage: Number(
            policy.refund_percentage
          ),
          minimum_days_before_arrival: Number(
            policy.minimum_days_before_arrival
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get cancellation policy error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cancellation policy",
    });
  }
};

const createAdminCancellationPolicy = async (
  req,
  res
) => {
  try {
    const {
      packageId,
      name,
      refundPercentage,
      minimumDaysBeforeArrival,
      description,
      isActive = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Policy name is required",
      });
    }

    const refund = Number(refundPercentage);
    const minimumDays = Number(minimumDaysBeforeArrival);

    if (
      !Number.isFinite(refund) ||
      refund < 0 ||
      refund > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Refund percentage must be between 0 and 100",
      });
    }

    if (
      !Number.isInteger(minimumDays) ||
      minimumDays < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum days before arrival must be a whole number greater than or equal to 0",
      });
    }

    if (packageId) {
      const packageResult = await query(
        `
        SELECT id
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
    }

    const result = await query(
      `
      INSERT INTO cancellation_policies (
        package_id,
        name,
        refund_percentage,
        minimum_days_before_arrival,
        description,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        package_id,
        name,
        refund_percentage,
        minimum_days_before_arrival,
        description,
        is_active,
        created_at
      `,
      [
        packageId || null,
        name.trim(),
        refund,
        minimumDays,
        description?.trim() || null,
        Boolean(isActive),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Cancellation policy created successfully",
      data: {
        policy: result.rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Create cancellation policy error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create cancellation policy",
    });
  }
};

const updateAdminCancellationPolicy = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      packageId,
      name,
      refundPercentage,
      minimumDaysBeforeArrival,
      description,
      isActive = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Policy name is required",
      });
    }

    const refund = Number(refundPercentage);
    const minimumDays = Number(minimumDaysBeforeArrival);

    if (
      !Number.isFinite(refund) ||
      refund < 0 ||
      refund > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Refund percentage must be between 0 and 100",
      });
    }

    if (
      !Number.isInteger(minimumDays) ||
      minimumDays < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum days before arrival must be a whole number greater than or equal to 0",
      });
    }

    if (packageId) {
      const packageResult = await query(
        `
        SELECT id
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
    }

    const result = await query(
      `
      UPDATE cancellation_policies
      SET
        package_id = $1,
        name = $2,
        refund_percentage = $3,
        minimum_days_before_arrival = $4,
        description = $5,
        is_active = $6
      WHERE id = $7
      RETURNING
        id,
        package_id,
        name,
        refund_percentage,
        minimum_days_before_arrival,
        description,
        is_active,
        created_at
      `,
      [
        packageId || null,
        name.trim(),
        refund,
        minimumDays,
        description?.trim() || null,
        Boolean(isActive),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cancellation policy not found",
      });
    }

    return res.json({
      success: true,
      message: "Cancellation policy updated successfully",
      data: {
        policy: result.rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Update cancellation policy error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update cancellation policy",
    });
  }
};

const updateAdminCancellationPolicyStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const result = await query(
      `
      UPDATE cancellation_policies
      SET is_active = $1
      WHERE id = $2
      RETURNING
        id,
        package_id,
        name,
        refund_percentage,
        minimum_days_before_arrival,
        description,
        is_active,
        created_at
      `,
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cancellation policy not found",
      });
    }

    return res.json({
      success: true,
      message: isActive
        ? "Cancellation policy activated"
        : "Cancellation policy deactivated",
      data: {
        policy: result.rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Update cancellation policy status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update cancellation policy status",
    });
  }
};



module.exports = {
  loginAdmin,
  getCurrentAdmin,
  getAdminDashboard,
  getAdminBookings,
  getAdminBookingById,
  updateAdminBookingStatus,
  getAdminPackages,
  getAdminPackageById,
  createAdminPackage,
  updateAdminPackage,
  updateAdminPackageStatus,
  getAdminPricingRules,
  getAdminPricingRuleById,
  createAdminPricingRule,
  updateAdminPricingRule,
  updateAdminPricingRuleStatus,
  getAdminTaxRules,
  getAdminTaxRuleById,
  createAdminTaxRule,
  updateAdminTaxRule,
  updateAdminTaxRuleStatus,
  getAdminSettings,
  updateAdminSetting,
    getAdminCancellationPolicies,
    getAdminCancellationPolicyById,
    createAdminCancellationPolicy,
    updateAdminCancellationPolicy,
    updateAdminCancellationPolicyStatus,
};