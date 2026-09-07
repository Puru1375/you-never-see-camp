const {
  query,
} = require("../config/database");

const {
  deleteS3Object,
} = require("../services/s3UploadService");
const { getImageUrl } = require("../services/s3ImageService");

const getPackageImages = async (req, res, next) => {
  try {
    const { packageId } = req.params;

    const result = await query(
      `
      SELECT
        id,
        package_id,
        s3_key,
        alt_text,
        sort_order,
        is_primary,
        is_active,
        created_at,
        updated_at
      FROM package_images
      WHERE package_id = $1
      ORDER BY
        is_primary DESC,
        sort_order ASC,
        created_at ASC
      `,
      [packageId]
    );

    const images = await Promise.all(
      result.rows.map(async (image) => ({
        id: image.id,
        packageId: image.package_id,
        s3Key: image.s3_key,
        imageUrl: await getImageUrl(image.s3_key),
        altText: image.alt_text,
        sortOrder: image.sort_order,
        isPrimary: image.is_primary,
        isActive: image.is_active,
      }))
    );

    return res.json({
      success: true,
      data: {
        images,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addPackageImage = async (req, res, next) => {
  try {
    const { packageId } = req.params;

    const {
      s3Key,
      altText,
      isPrimary = false,
    } = req.body;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: "S3 key is required",
      });
    }

    if (
      !s3Key.startsWith("packages/")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid package image key",
      });
    }

    const packageResult = await query(
      `
      SELECT id
      FROM packages
      WHERE id = $1
      LIMIT 1
      `,
      [packageId]
    );

    if (packageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const client = await require("../config/database")
      .pool.connect();

    try {
      await client.query("BEGIN");

      if (isPrimary) {
        await client.query(
          `
          UPDATE package_images
          SET
            is_primary = false,
            updated_at = NOW()
          WHERE package_id = $1
            AND is_active = true
          `,
          [packageId]
        );
      }

      const result = await client.query(
        `
        INSERT INTO package_images (
          package_id,
          s3_key,
          alt_text,
          sort_order,
          is_primary
        )
        VALUES (
          $1,
          $2,
          $3,
          COALESCE(
            (
              SELECT MAX(sort_order) + 1
              FROM package_images
              WHERE package_id = $1
            ),
            0
          ),
          $4
        )
        RETURNING *
        `,
        [
          packageId,
          s3Key,
          altText || null,
          Boolean(isPrimary),
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

const updatePackageImage = async (req, res, next) => {
  try {
    const { packageId, imageId } = req.params;
    const {
      s3Key,
      altText,
      sortOrder,
      isPrimary,
      isActive,
    } = req.body || {};

    const result = await query(
      `
      UPDATE package_images
      SET
        s3_key = COALESCE($1, s3_key),
        alt_text = COALESCE($2, alt_text),
        sort_order = COALESCE($3, sort_order),
        is_primary = COALESCE($4, is_primary),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
      WHERE id = $6
        AND package_id = $7
      RETURNING *
      `,
      [
        s3Key || null,
        altText ?? null,
        sortOrder ?? null,
        isPrimary ?? null,
        isActive ?? null,
        imageId,
        packageId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Package image not found",
      });
    }

    return res.json({
      success: true,
      data: { image: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

const setPrimaryPackageImage = async (
  req,
  res,
  next
) => {
  try {
    const { packageId, imageId } = req.params;

    const client = await require("../config/database")
      .pool.connect();

    try {
      await client.query("BEGIN");

      const imageResult = await client.query(
        `
        SELECT id
        FROM package_images
        WHERE id = $1
          AND package_id = $2
          AND is_active = true
        FOR UPDATE
        `,
        [imageId, packageId]
      );

      if (imageResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Package image not found",
        });
      }

      await client.query(
        `
        UPDATE package_images
        SET
          is_primary = false,
          updated_at = NOW()
        WHERE package_id = $1
          AND is_active = true
        `,
        [packageId]
      );

      const result = await client.query(
        `
        UPDATE package_images
        SET
          is_primary = true,
          updated_at = NOW()
        WHERE id = $1
          AND package_id = $2
        RETURNING *
        `,
        [imageId, packageId]
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

const deletePackageImage = async (
  req,
  res,
  next
) => {
  try {
    const { packageId, imageId } = req.params;

    const result = await query(
      `
      SELECT
        id,
        s3_key
      FROM package_images
      WHERE id = $1
        AND package_id = $2
        AND is_active = true
      LIMIT 1
      `,
      [imageId, packageId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Package image not found",
      });
    }

    const image = result.rows[0];

    await deleteS3Object(image.s3_key);

    await query(
      `
      UPDATE package_images
      SET
        is_active = false,
        updated_at = NOW()
      WHERE id = $1
        AND package_id = $2
      `,
      [imageId, packageId]
    );

    return res.json({
      success: true,
      message: "Package image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPackageImages,
  addPackageImage,
  updatePackageImage,
  setPrimaryPackageImage,
  deletePackageImage,
};