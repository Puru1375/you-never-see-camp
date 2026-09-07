const express = require("express");

const {
  createPresignedUpload,
} = require("../controllers/adminUploadController");

const {
  requireAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

router.post(
  "/presign",
  requireAdmin,
  createPresignedUpload
);

module.exports = router;