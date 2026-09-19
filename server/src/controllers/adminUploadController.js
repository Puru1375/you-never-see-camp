const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} = require("../services/s3UploadService");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "camp-images";

const sanitizeSegment = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const createImageKey = ({
  type,
  packageSlug,
  category,
  originalName,
  contentType,
}) => {
  const extension = ALLOWED_IMAGE_TYPES[contentType];

  if (!extension) {
    throw new Error("Unsupported image content type");
  }

  const randomId = crypto
    .randomBytes(8)
    .toString("hex");

  const baseName =
    sanitizeSegment(
      originalName.replace(/\.[^/.]+$/, "")
    ) || "image";

  if (type === "package") {
    const safePackageSlug =
      sanitizeSegment(packageSlug);

    if (!safePackageSlug) {
      throw new Error("Package slug is required");
    }

    return `packages/${safePackageSlug}/${baseName}-${randomId}.${extension}`;
  }

  if (type === "gallery") {
    const safeCategory =
      sanitizeSegment(category) || "general";

    return `gallery/${safeCategory}/${baseName}-${randomId}.${extension}`;
  }

  throw new Error("Invalid upload type");
};

const createPresignedUpload = async (req, res, next) => {
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

    if (!contentType || !ALLOWED_IMAGE_TYPES[contentType]) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG and WebP images are allowed",
      });
    }

    const size = Number(fileSize);

    if (!Number.isFinite(size) || size <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid file size",
      });
    }

    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Image size must not exceed 10 MB",
      });
    }

    if (type === "package" && !packageSlug) {
      return res.status(400).json({
        success: false,
        message: "Package slug is required for package images",
      });
    }

    const key = createImageKey({
      type,
      packageSlug,
      category,
      originalName: fileName,
      contentType,
    });

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(key);

    if (error) {
      console.error("Supabase signed upload error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create upload URL",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl: data.signedUrl,
        token: data.token,
        key,
        contentType,
        expiresIn: 7200,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPresignedUpload,
};