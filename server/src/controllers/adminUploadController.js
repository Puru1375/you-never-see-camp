const {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  createImageKey,
  createPresignedUploadUrl,
} = require("../services/s3UploadService");

const createPresignedUpload = async (
  req,
  res,
  next
) => {
  try {
    const {
      type,
      packageSlug,
      category,
      fileName,
      contentType,
      fileSize,
    } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Upload type is required",
      });
    }

    if (!["package", "gallery"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload type",
      });
    }

    if (!fileName || typeof fileName !== "string") {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    if (
      !contentType ||
      !ALLOWED_IMAGE_TYPES[contentType]
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only JPG, PNG and WebP images are allowed",
      });
    }

    const size = Number(fileSize);

    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid file size",
      });
    }

    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message:
          "Image size must not exceed 10 MB",
      });
    }

    if (type === "package" && !packageSlug) {
      return res.status(400).json({
        success: false,
        message:
          "Package slug is required for package images",
      });
    }

    const key = createImageKey({
      type,
      packageSlug,
      category,
      originalName: fileName,
      contentType,
    });

    const uploadUrl =
      await createPresignedUploadUrl({
        key,
        contentType,
      });

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        key,
        contentType,
        expiresIn: 300,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPresignedUpload,
};