const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");

const {
  s3Client,
  bucket,
} = require("../config/s3");

const crypto = require("crypto");

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
  const extension =
    ALLOWED_IMAGE_TYPES[contentType];

  if (!extension) {
    throw new Error(
      "Unsupported image content type"
    );
  }

  const randomId = crypto
    .randomBytes(8)
    .toString("hex");

  const baseName = sanitizeSegment(
    originalName
      .replace(/\.[^/.]+$/, "")
  ) || "image";

  if (type === "package") {
    const safePackageSlug =
      sanitizeSegment(packageSlug);

    if (!safePackageSlug) {
      throw new Error(
        "Package slug is required"
      );
    }

    return `packages/${safePackageSlug}/${baseName}-${randomId}.${extension}`;
  }

  if (type === "gallery") {
    const safeCategory =
      sanitizeSegment(category) || "general";

    return `gallery/${safeCategory}/${baseName}-${randomId}.${extension}`;
  }

  throw new Error(
    "Invalid upload type"
  );
};

const createPresignedUploadUrl = async ({
  key,
  contentType,
}) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(
    s3Client,
    command,
    {
      expiresIn: 300,
    }
  );
};

const deleteS3Object = async (key) => {
  if (!key) {
    throw new Error(
      "S3 object key is required"
    );
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);

  return true;
};

module.exports = {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  createImageKey,
  createPresignedUploadUrl,
  deleteS3Object,
};