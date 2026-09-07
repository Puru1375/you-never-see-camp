const express = require("express");

const {
  requestOtp,
  verifyOtp,
  logoutCustomer,
} = require("../controllers/customerAuthController");

const router = express.Router();

router.post(
  "/request-otp",
  requestOtp
);

router.post(
  "/verify-otp",
  verifyOtp
);

router.post(
  "/logout",
  logoutCustomer
);

module.exports = router;