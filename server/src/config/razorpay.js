const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayRefund = async (
  paymentId,
  amountInPaise
) => {
  return razorpay.payments.refund(paymentId, {
    amount: amountInPaise,
    speed: "normal",
  });
};

const getRazorpayRefund = async (refundId) => {
  return razorpay.refunds.fetch(refundId);
};

module.exports = razorpay;
module.exports.createRazorpayRefund = createRazorpayRefund;
module.exports.getRazorpayRefund = getRazorpayRefund;