const express = require("express");

const {
  getPackageImages,
  addPackageImage,
  updatePackageImage,
  setPrimaryPackageImage,
  deletePackageImage,
} = require("../controllers/adminPackageImageController");

const {
  requireAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

router.get(
  "/packages/:packageId/images",
  requireAdmin,
  getPackageImages
);

router.post(
  "/packages/:packageId/images",
  requireAdmin,
  addPackageImage
);

router.put(
  "/packages/:packageId/images/:imageId",
  requireAdmin,
  updatePackageImage
);

router.patch(
  "/packages/:packageId/images/:imageId/primary",
  requireAdmin,
  setPrimaryPackageImage
);

router.delete(
  "/packages/:packageId/images/:imageId",
  requireAdmin,
  deletePackageImage
);

module.exports = router;