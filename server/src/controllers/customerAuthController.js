const crypto = require("crypto");

const { query } = require("../config/database");

const {
  generateOtp,
  hashValue,
  generateSessionToken,
  getOtpExpiry,
  getSessionExpiry,
} = require("../services/customerAuthService");

const {
  sendCustomerOtpEmail,
} = require("../services/customerEmailService");

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const requestOtp = async (req, res) => {
  try {
    const {
      bookingReference,
      email,
    } = req.body;

    if (!bookingReference || !email) {
      return res.status(400).json({
        success: false,
        message: "Booking reference and email are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const bookingResult = await query(
      `
      SELECT
        id,
        booking_reference,
        customer_name,
        customer_email,
        status
      FROM bookings
      WHERE booking_reference = $1
        AND LOWER(customer_email) = $2
      LIMIT 1
      `,
      [
        bookingReference.trim(),
        normalizedEmail,
      ]
    );

    /*
     * Important security rule:
     *
     * Do not tell the customer whether the
     * booking/reference/email combination exists.
     */
    if (bookingResult.rows.length === 0) {
      return res.json({
        success: true,
        message:
          "If the booking details are correct, a verification code has been sent.",
      });
    }

    const booking = bookingResult.rows[0];

    /*
     * Invalidate previous unused OTPs for this booking.
     */
    await query(
      `
      UPDATE customer_otp_challenges
      SET consumed_at = NOW()
      WHERE booking_id = $1
        AND contact_type = 'email'
        AND contact_value = $2
        AND consumed_at IS NULL
      `,
      [
        booking.id,
        normalizedEmail,
      ]
    );

    const otp = generateOtp();
    const otpHash = hashValue(otp);
    const expiresAt = getOtpExpiry();

    await query(
      `
      INSERT INTO customer_otp_challenges (
        booking_id,
        contact_type,
        contact_value,
        code_hash,
        expires_at
      )
      VALUES ($1, 'email', $2, $3, $4)
      `,
      [
        booking.id,
        normalizedEmail,
        otpHash,
        expiresAt,
      ]
    );

    await sendCustomerOtpEmail({
      email: normalizedEmail,
      customerName: booking.customer_name,
      bookingReference: booking.booking_reference,
      otp,
    });

    return res.json({
      success: true,
      message:
        "If the booking details are correct, a verification code has been sent.",
    });
  } catch (error) {
    console.error(
      "Customer OTP request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to process verification request",
    });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const {
      bookingReference,
      email,
      otp,
    } = req.body;

    if (!bookingReference || !email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Booking reference, email and OTP are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const bookingResult = await query(
      `
      SELECT
        id,
        booking_reference,
        customer_name,
        customer_email
      FROM bookings
      WHERE booking_reference = $1
        AND LOWER(customer_email) = $2
      LIMIT 1
      `,
      [
        bookingReference.trim(),
        normalizedEmail,
      ]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification details",
      });
    }

    const booking = bookingResult.rows[0];

    const otpResult = await query(
      `
      SELECT
        id,
        code_hash,
        expires_at,
        attempts,
        max_attempts
      FROM customer_otp_challenges
      WHERE booking_id = $1
        AND contact_type = 'email'
        AND contact_value = $2
        AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [
        booking.id,
        normalizedEmail,
      ]
    );

    if (otpResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Verification code expired or invalid",
      });
    }

    const challenge = otpResult.rows[0];

    if (
      new Date(challenge.expires_at) <= new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    if (
      challenge.attempts >= challenge.max_attempts
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many verification attempts. Please request a new code.",
      });
    }

    const submittedHash = hashValue(
      otp.trim()
    );

    const hashesMatch = crypto.timingSafeEqual(
      Buffer.from(submittedHash),
      Buffer.from(challenge.code_hash)
    );

    if (!hashesMatch) {
      await query(
        `
        UPDATE customer_otp_challenges
        SET attempts = attempts + 1
        WHERE id = $1
        `,
        [challenge.id]
      );

      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    /*
     * OTP is valid.
     * Consume it so it cannot be reused.
     */
    await query(
      `
      UPDATE customer_otp_challenges
      SET consumed_at = NOW()
      WHERE id = $1
      `,
      [challenge.id]
    );

    /*
     * Create secure customer session.
     */
    const sessionToken =
      generateSessionToken();

    const sessionTokenHash =
      hashValue(sessionToken);

    const sessionExpiresAt =
      getSessionExpiry();

    await query(
      `
      INSERT INTO customer_sessions (
        contact_type,
        contact_value,
        session_token_hash,
        expires_at,
        last_used_at
      )
      VALUES (
        'email',
        $1,
        $2,
        $3,
        NOW()
      )
      `,
      [
        normalizedEmail,
        sessionTokenHash,
        sessionExpiresAt,
      ]
    );

    /*
     * HttpOnly cookie.
     *
     * Production:
     * secure = true
     *
     * Local development:
     * secure = false
     */
    res.cookie(
      "customer_session",
      sessionToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge:
          30 * 60 * 1000,
        path: "/",
      }
    );

    return res.json({
      success: true,
      message: "Verification successful",
      customer: {
        name: booking.customer_name,
        email: booking.customer_email,
      },
    });
  } catch (error) {
    console.error(
      "Customer OTP verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify code",
    });
  }
};


const logoutCustomer = async (req, res) => {
  try {
    const token =
      req.cookies?.customer_session;

    if (token) {
      const tokenHash =
        hashValue(token);

      await query(
        `
        UPDATE customer_sessions
        SET revoked_at = NOW()
        WHERE session_token_hash = $1
          AND revoked_at IS NULL
        `,
        [tokenHash]
      );
    }

    res.clearCookie(
      "customer_session",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(
      "Customer logout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
};


module.exports = {
  requestOtp,
  verifyOtp,
  logoutCustomer,
};