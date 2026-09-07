const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

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
  uploadUrl,
  file
) => {
  const response = await fetch(
    uploadUrl,
    {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    }
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");

    throw new Error(
      details || "Failed to upload image to S3"
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