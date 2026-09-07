import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
}

export const getAdminTaxRules = async () => {
  const response = await apiRequest("/admin/tax", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const getAdminTaxRuleById = async (id) => {
  const response = await apiRequest(`/admin/tax/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const createAdminTaxRule = async (data) => {
  const response = await apiRequest("/admin/tax", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  return response.data || response;
};

export const updateAdminTaxRule = async (id, data) => {
  const response = await apiRequest(`/admin/tax/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  return response.data || response;
};

export const updateAdminTaxRuleStatus = async (
  id,
  is_active
) => {
  const response = await apiRequest(
    `/admin/tax/${id}/status`,
    {
      method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      body: JSON.stringify({ is_active }),
    }
  );

  return response.data || response;
};