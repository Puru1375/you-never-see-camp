const { query } = require("../config/database");
const { hashValue } = require("../services/customerAuthService");

const requireCustomer = async (req, res, next) => {
  try {
    const sessionToken =
      req.cookies?.customer_session;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const sessionTokenHash =
      hashValue(sessionToken);

    const result = await query(
      `
      SELECT
        id,
        contact_type,
        contact_value,
        expires_at,
        revoked_at
      FROM customer_sessions
      WHERE session_token_hash = $1
      LIMIT 1
      `,
      [sessionTokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer session",
      });
    }

    const session = result.rows[0];

    if (session.revoked_at) {
      return res.status(401).json({
        success: false,
        message: "Customer session has been revoked",
      });
    }

    if (new Date(session.expires_at) <= new Date()) {
      await query(
        `
        UPDATE customer_sessions
        SET revoked_at = NOW()
        WHERE id = $1
        `,
        [session.id]
      );

      return res.status(401).json({
        success: false,
        message: "Customer session has expired",
      });
    }

    /*
     * Update last activity.
     */
    await query(
      `
      UPDATE customer_sessions
      SET last_used_at = NOW()
      WHERE id = $1
      `,
      [session.id]
    );

    /*
     * Make customer identity available
     * to controllers.
     */
    req.customer = {
      sessionId: session.id,
      contactType: session.contact_type,
      contactValue: session.contact_value,
    };

    next();
  } catch (error) {
    console.error(
      "Customer authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate customer",
    });
  }
};

module.exports = {
  requireCustomer,
};