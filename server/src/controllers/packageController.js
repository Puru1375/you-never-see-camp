const {
  query,
} = require("../config/database");
const {
  getImageUrl,
} = require("../services/s3ImageService");

const getPackageImages = async (packageId) => {
  const imageResult = await query(
    `
    SELECT
      s3_key
    FROM package_images
    WHERE package_id = $1
      AND is_active = true
    ORDER BY
      is_primary DESC,
      sort_order ASC,
      created_at ASC
    `,
    [packageId]
  );

  return Promise.all(
    imageResult.rows.map((image) =>
      getImageUrl(image.s3_key)
    )
  );
};

const   getPackages = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        p.*,

        COALESCE(
          (
            SELECT json_agg(
              pm.name
              ORDER BY pm.sort_order ASC
            )
            FROM package_meals pm
            WHERE pm.package_id = p.id
          ),
          '[]'::json
        ) AS meals,

        COALESCE(
          (
            SELECT json_agg(
              pa.name
              ORDER BY pa.sort_order ASC
            )
            FROM package_activities pa
            WHERE pa.package_id = p.id
          ),
          '[]'::json
        ) AS activities

      FROM packages p

      WHERE p.is_active = true

      ORDER BY
        p.featured DESC,
        p.created_at DESC
    `);

    const packages = await Promise.all(
      result.rows.map(async (packageData) => ({
        ...packageData,
        images: await getPackageImages(packageData.id),
      }))
    );

    

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

const getPackageBySlug = async (
  req,
  res,
  next
) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `
      SELECT
        p.*,

        COALESCE(
          (
            SELECT json_agg(
              pm.name
              ORDER BY pm.sort_order ASC
            )
            FROM package_meals pm
            WHERE pm.package_id = p.id
          ),
          '[]'::json
        ) AS meals,

        COALESCE(
          (
            SELECT json_agg(
              pa.name
              ORDER BY pa.sort_order ASC
            )
            FROM package_activities pa
            WHERE pa.package_id = p.id
          ),
          '[]'::json
        ) AS activities

      FROM packages p

      WHERE p.slug = $1
        AND p.is_active = true

      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }



    const images = await getPackageImages(result.rows[0].id);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        images,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPackages,
  getPackageBySlug,
};