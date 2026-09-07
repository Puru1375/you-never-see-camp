import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
}

export const getAdminPackages = async () => {
  const response = await apiRequest("/admin/packages", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const getAdminPackageById = async (id) => {
  const response = await apiRequest(`/admin/packages/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const createAdminPackage = async (packageData) => {
  return apiRequest("/admin/packages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(packageData),
  });
}
    

export const updateAdminPackage = async (id, packageData) => {
  return apiRequest(`/admin/packages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(packageData),
  });
};

export const updateAdminPackageStatus = async (id, is_active) => {
  return apiRequest(`/admin/packages/${id}/status`, {
    method: "PATCH",
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      is_active,
    }),
  });
};