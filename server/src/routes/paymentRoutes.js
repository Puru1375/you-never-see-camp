const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} = require("../controllers/paymentController");

const router = express.Router();

router.post(
  "/create-order",
  createPaymentOrder
);

router.post(
  "/verify",
  verifyPayment
);

router.post(
  "/webhook",
  handleWebhook
);

module.exports = router;