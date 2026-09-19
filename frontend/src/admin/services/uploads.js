const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";
import { supabase } from "../../config/supabase";

const getAdminToken = () => {
  return localStorage.getItem("admin_token");
};

export const createPresignedUpload = async ({
  type,
  packageSlug,
  category,
  file,
}) => {
  const token = getAdminToken();

  if (!token) {
    throw new Error(
      "Admin authentication required"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/uploads/presign`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        packageSlug,
        category,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Unable to prepare image upload"
    );

    error.status = response.status;

    throw error;
  }

  return data.data || data;
};

export const uploadFileToS3 = async (
  uploadData,
  file
) => {
  const {
    key,
    token,
    contentType,
  } = uploadData;

  if (!key || !token) {
    throw new Error(
      "Invalid Supabase upload data"
    );
  }

  const { error } = await supabase.storage
    .from("camp-images")
    .uploadToSignedUrl(
      key,
      token,
      file,
      {
        contentType:
          contentType || file.type,
      }
    );

  if (error) {
    console.error(
      "Supabase upload error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to upload image"
    );
  }

  return true;
};

export const uploadImage = async ({
  type,
  packageSlug,
  category,
  file,
}) => {
  const response =
    await createPresignedUpload({
      type,
      packageSlug,
      category,
      file,
    });

  const uploadData =
    response.data || response;

  await uploadFileToS3(
    uploadData.uploadUrl,
    file
  );

  return {
    key: uploadData.key,
    contentType: uploadData.contentType,
  };
};