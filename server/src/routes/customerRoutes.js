const express = require("express");

const {
  getCurrentCustomer,
  getCustomerBookings,
    getCustomerBookingByReference,
} = require("../controllers/customerController");

const {
  requireCustomer,
} = require("../middleware/customerAuth");

const router = express.Router();

router.get(
  "/me",
  requireCustomer,
  getCurrentCustomer
);

router.get(
  "/bookings",
  requireCustomer,
  getCustomerBookings
);

router.get(
  "/bookings/:bookingReference",
  requireCustomer,
  getCustomerBookingByReference
);

module.exports = router;