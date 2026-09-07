const express = require("express");

const {
  getGalleryImages,
  addGalleryImage,
  updateGalleryImage,
  setFeaturedGalleryImage,
  deleteGalleryImage,
} = require("../controllers/adminGalleryController");

const {
  requireAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

router.get(
  "/gallery",
  requireAdmin,
  getGalleryImages
);

router.post(
  "/gallery",
  requireAdmin,
  addGalleryImage
);

router.put(
  "/gallery/:imageId",
  requireAdmin,
  updateGalleryImage
);

router.patch(
  "/gallery/:imageId/featured",
  requireAdmin,
  setFeaturedGalleryImage
);

router.delete(
  "/gallery/:imageId",
  requireAdmin,
  deleteGalleryImage
);

module.exports = router;