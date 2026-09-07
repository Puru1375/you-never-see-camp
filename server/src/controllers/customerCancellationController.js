const {
  getCancellationPreview,
  cancelBooking,
} = require("./cancellationController");


const customerCancellationPreview = async (
  req,
  res,
  next
) => {
  try {
    const { bookingReference } = req.params;

    if (!req.customer) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required",
      });
    }

    /*
     * Use the authenticated customer's email.
     *
     * The customer does NOT send the email
     * themselves.
     */
    req.body = {
      customerEmail:
        req.customer.contactValue,
    };

    req.params.bookingReference =
      bookingReference.trim();

    return getCancellationPreview(
      req,
      res
    );
  } catch (error) {
    console.error(
      "Customer cancellation preview error:",
      error
    );

    return next(error);
  }
};


const customerCancelBooking = async (
  req,
  res,
  next
) => {
  try {
    const { bookingReference } = req.params;

    if (!req.customer) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required",
      });
    }

    /*
     * Never trust customerEmail/customerPhone
     * coming from the frontend.
     *
     * Use the authenticated session identity.
     */
    req.body = {
      customerEmail:
        req.customer.contactValue,

      reason:
        req.body?.reason || null,
    };

    req.params.bookingReference =
      bookingReference.trim();

    return cancelBooking(
      req,
      res
    );
  } catch (error) {
    console.error(
      "Customer cancellation error:",
      error
    );

    return next(error);
  }
};


module.exports = {
  customerCancellationPreview,
  customerCancelBooking,
};