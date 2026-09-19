const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "camp-images";


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
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(key);

  if (error) {
    throw error;
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    key,
    contentType,
  };
};

const deleteS3Object = async (key) => {
  if (!key) {
    throw new Error("Image key is required");
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([key]);

  if (error) {
    throw error;
  }

  return true;
};

module.exports = {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  createImageKey,
  createPresignedUploadUrl,
  deleteS3Object,
};