const { query } = require("../config/database");
const { getImageUrl } = require("../services/s3ImageService");

const getGalleryImages = async (req, res) => {
  try {
    const { category } = req.query;

    const result = await query(
      `
      SELECT
        id,
        s3_key,
        category,
        title,
        caption,
        alt_text,
        sort_order,
        is_featured
      FROM gallery_images
      WHERE is_active = true
        AND ($1::text IS NULL OR category = $1)
      ORDER BY
        is_featured DESC,
        sort_order ASC,
        created_at DESC
      `,
      [category || null]
    );

    const images = await Promise.all(
      result.rows.map(async (image) => ({
        id: image.id,
        imageUrl: await getImageUrl(image.s3_key),
        category: image.category,
        title: image.title,
        caption: image.caption,
        altText: image.alt_text,
        sortOrder: image.sort_order,
        isFeatured: image.is_featured,
      }))
    );

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get gallery images error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load gallery images",
    });
  }
};

module.exports = {
  getGalleryImages,
};