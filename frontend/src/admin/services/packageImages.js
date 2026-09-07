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
        "Request failed"
    );

    error.status = response.status;

    throw error;
  }

  return data;
};

export const getPackageImages = (
  packageId
) => {
  return request(
    `/admin/packages/${packageId}/images`
  ).then((response) => response.data?.images || []);
};

export const addPackageImage = (
  packageId,
  imageData
) => {
  return request(
    `/admin/packages/${packageId}/images`,
    {
      method: "POST",
      body: JSON.stringify(imageData),
    }
  );
};

export const updatePackageImage = (
  packageId,
  imageId,
  imageData
) => {
  return request(
    `/admin/packages/${packageId}/images/${imageId}`,
    {
      method: "PUT",
      body: JSON.stringify(imageData),
    }
  );
};

export const setPrimaryPackageImage = (
  packageId,
  imageId
) => {
  return request(
    `/admin/packages/${packageId}/images/${imageId}/primary`,
    {
      method: "PATCH",
    }
  );
};

export const deletePackageImage = (
  packageId,
  imageId
) => {
  return request(
    `/admin/packages/${packageId}/images/${imageId}`,
    {
      method: "DELETE",
    }
  );
};