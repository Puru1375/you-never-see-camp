const express = require("express");

const {
  customerCancellationPreview,
  customerCancelBooking,
} = require("../controllers/customerCancellationController");

const {
  requireCustomer,
} = require("../middleware/customerAuth");

const router = express.Router();

router.post(
  "/bookings/:bookingReference/cancellation-preview",
  requireCustomer,
  customerCancellationPreview
);

router.post(
  "/bookings/:bookingReference/cancel",
  requireCustomer,
  customerCancelBooking
);

module.exports = router;