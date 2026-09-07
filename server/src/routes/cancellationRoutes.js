const express = require("express");

const {
  getCancellationPreview,
  cancelBooking,
} = require("../controllers/cancellationController");

const router = express.Router();

router.post(
  "/bookings/:bookingReference/cancellation-preview",
  getCancellationPreview
);

router.post(
  "/bookings/:bookingReference/cancel",
  cancelBooking
);

module.exports = router;
