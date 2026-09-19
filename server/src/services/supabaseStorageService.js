const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

const BUCKET = "camp-images";

const uploadImage = async ({
  key,
  buffer,
  contentType,
}) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return key;
};

const deleteImage = async (key) => {
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

const getPublicImageUrl = (key) => {
  if (!key) return null;

  const {
    data,
  } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(key);

  return data.publicUrl;
};

module.exports = {
  uploadImage,
  deleteImage,
  getPublicImageUrl,
};