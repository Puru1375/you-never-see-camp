const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = 5;
const SESSION_EXPIRY_MINUTES = 30;

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashValue = (value) => {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
};

const generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getOtpExpiry = () => {
  return new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );
};

const getSessionExpiry = () => {
  return new Date(
    Date.now() + SESSION_EXPIRY_MINUTES * 60 * 1000
  );
};

module.exports = {
  generateOtp,
  hashValue,
  generateSessionToken,
  getOtpExpiry,
  getSessionExpiry,
};