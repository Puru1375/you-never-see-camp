const express = require("express");

const {
  getAvailability,
  getBookingQuote,
  createBooking,
    getBookingByReference,
} = require("../controllers/bookingController");

const router = express.Router();

router.get(
  "/availability",
  getAvailability
);

router.post(
  "/quote",
  getBookingQuote
);

router.post(
  "/",
  createBooking
);

router.get("/reference/:reference", getBookingByReference);

module.exports = router;