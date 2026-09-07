const {
  pool,
  query,
} = require("../config/database");

const {
  deleteS3Object,
} = require("../services/s3UploadService");

const {
  getImageUrl,
} = require("../services/s3ImageService");

const getGalleryImages = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        id,
        s3_key,
        category,
        title,
        caption,
        alt_text,
        sort_order,
        is_featured,
        is_active,
        created_at,
        updated_at
      FROM gallery_images
      ORDER BY
        is_featured DESC,
        sort_order ASC,
        created_at DESC
    `);

    const images = await Promise.all(
      result.rows.map(async (image) => ({
        id: image.id,
        s3Key: image.s3_key,
        imageUrl: await getImageUrl(image.s3_key),
        category: image.category,
        title: image.title,
        caption: image.caption,
        altText: image.alt_text,
        sortOrder: image.sort_order,
        isFeatured: image.is_featured,
        isActive: image.is_active,
      }))
    );

    return res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

const addGalleryImage = async (req, res, next) => {
  try {
    const {
      s3Key,
      category = "general",
      title,
      caption,
      altText,
      isFeatured = false,
    } = req.body;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: "S3 key is required",
      });
    }

    if (!s3Key.startsWith("gallery/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery S3 key",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      if (isFeatured) {
        await client.query(`
          UPDATE gallery_images
          SET
            is_featured = false,
            updated_at = NOW()
          WHERE is_featured = true
            AND is_active = true
        `);
      }

      const result = await client.query(
        `
        INSERT INTO gallery_images (
          s3_key,
          category,
          title,
          caption,
          alt_text,
          sort_order,
          is_featured
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          COALESCE(
            (
              SELECT MAX(sort_order) + 1
              FROM gallery_images
              WHERE category = $2::varchar
            ),
            0
          ),
          $6
        )
        RETURNING *
        `,
        [
          s3Key,
          category,
          title || null,
          caption || null,
          altText || null,
          Boolean(isFeatured),
        ]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        data: {
          image: result.rows[0],
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

const updateGalleryImage = async (
  req,
  res,
  next
) => {
  try {
    const { imageId } = req.params;

    const {
      category,
      title,
      caption,
      altText,
      sortOrder,
      isActive,
    } = req.body;

    const result = await query(
      `
      UPDATE gallery_images
      SET
        category = COALESCE($1, category),
        title = COALESCE($2, title),
        caption = COALESCE($3, caption),
        alt_text = COALESCE($4, alt_text),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        category ?? null,
        title ?? null,
        caption ?? null,
        altText ?? null,
        sortOrder ?? null,
        isActive ?? null,
        imageId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    return res.json({
      success: true,
      data: {
        image: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

const setFeaturedGalleryImage = async (
  req,
  res,
  next
) => {
  try {
    const { imageId } = req.params;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const imageResult = await client.query(
        `
        SELECT id
        FROM gallery_images
        WHERE id = $1
          AND is_active = true
        FOR UPDATE
        `,
        [imageId]
      );

      if (imageResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Gallery image not found",
        });
      }

      await client.query(`
        UPDATE gallery_images
        SET
          is_featured = false,
          updated_at = NOW()
        WHERE is_featured = true
      `);

      const result = await client.query(
        `
        UPDATE gallery_images
        SET
          is_featured = true,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [imageId]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,
        data: {
          image: result.rows[0],
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

const deleteGalleryImage = async (
  req,
  res,
  next
) => {
  try {
    const { imageId } = req.params;

    const result = await query(
      `
      SELECT
        id,
        s3_key
      FROM gallery_images
      WHERE id = $1
      LIMIT 1
      `,
      [imageId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    const image = result.rows[0];

    await deleteS3Object(image.s3_key);

    await query(
      `
      DELETE FROM gallery_images
      WHERE id = $1
      `,
      [imageId]
    );

    return res.json({
      success: true,
      message:
        "Gallery image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGalleryImages,
  addGalleryImage,
  updateGalleryImage,
  setFeaturedGalleryImage,
  deleteGalleryImage,
};