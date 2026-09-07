const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const    getPackages = () => {
  return apiRequest("/packages");
};

export const getPackageBySlug = (slug) => {
  return apiRequest(`/packages/${slug}`);
};

export const getExperiences = () => {
  return apiRequest("/experiences");
};

export const getExperienceBySlug = (slug) => {
  return apiRequest(`/experiences/${slug}`);
};

export const getGallery = () => {
  return apiRequest("/gallery");

};

export const getSiteSettings = () => {
  return apiRequest("/settings");
};

export const checkAvailability = ({
  packageId,
  date,
  adults,
  children,
  infants,
}) => {
  const params = new URLSearchParams({
    packageId,
    date,
    adults,
    children,
    infants,
  });

  return apiRequest(
    `/bookings/availability?${params.toString()}`
  );
};

export const getBookingQuote = ({
  packageId,
  adults,
  children,
  infants,
}) => {
  return apiRequest("/bookings/quote", {
    method: "POST",
    body: JSON.stringify({
      packageId,
      adults,
      children,
      infants,
    }),
  });
};