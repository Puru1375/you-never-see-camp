const express = require("express");

const {
  getPackages,
  getPackageBySlug,
} = require("../controllers/packageController");

const router = express.Router();

router.get("/", getPackages);

router.get("/:slug", getPackageBySlug);

module.exports = router;