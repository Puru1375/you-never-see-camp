const express = require("express");

const {
  getExperiences,
  getExperienceBySlug,
} = require("../controllers/experienceController");

const router = express.Router();

router.get("/", getExperiences);
router.get("/:slug", getExperienceBySlug);

module.exports = router;