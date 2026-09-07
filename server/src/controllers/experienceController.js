const { query } = require("../config/database");

const getExperiences = async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT *
      FROM experiences
      WHERE is_active = true
      ORDER BY created_at DESC
      `
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getExperienceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `
      SELECT *
      FROM experiences
      WHERE slug = $1
        AND is_active = true
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperiences,
  getExperienceBySlug,
};