const express = require("express");

const {
  getCustomerBookingPayment,
  createCustomerPaymentOrder,
  verifyCustomerPayment,
} = require("../controllers/customerPaymentController");

const {
  requireCustomer,
} = require("../middleware/customerAuth");

const router = express.Router();

router.get(
  "/bookings/:bookingReference/payment",
  requireCustomer,
  getCustomerBookingPayment
);

router.post(
  "/bookings/:bookingReference/payment",
  requireCustomer,
  createCustomerPaymentOrder
);

router.post(
  "/bookings/:bookingReference/payment/verify",
  requireCustomer,
  verifyCustomerPayment
);

module.exports = router;