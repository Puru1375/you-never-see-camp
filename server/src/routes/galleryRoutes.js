const express = require("express");
const router = express.Router();

const {
  getGalleryImages,
} = require("../controllers/galleryController");

router.get("/", getGalleryImages);

module.exports = router;