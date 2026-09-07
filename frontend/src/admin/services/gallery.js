const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const getToken = () =>
  localStorage.getItem("admin_token");

const request = async (
  url,
  options = {}
) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${url}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Gallery request failed"
    );

    error.status = response.status;

    throw error;
  }

  return data;
};

export const getAdminGallery = async (category = "") => {
  const query = category
    ? `?category=${encodeURIComponent(category)}`
    : "";

  const response = await fetch(
    `${API_BASE_URL}/gallery${query}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load gallery"
    );
  }

  return data.data;
};

export const addGalleryImage = (
  imageData
) =>
  request("/admin/gallery", {
    method: "POST",
    body: JSON.stringify(imageData),
  });

export const updateGalleryImage = (
  imageId,
  imageData
) =>
  request(`/admin/gallery/${imageId}`, {
    method: "PUT",
    body: JSON.stringify(imageData),
  });

export const setFeaturedGalleryImage = (
  imageId
) =>
  request(
    `/admin/gallery/${imageId}/featured`,
    {
      method: "PATCH",
    }
  );

export const deleteGalleryImage = (
  imageId
) =>
  request(`/admin/gallery/${imageId}`, {
    method: "DELETE",
  });