import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
}

export const getAdminPricingRules = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.packageId) {
    query.append("packageId", params.packageId);
  }

  if (params.guestType) {
    query.append("guestType", params.guestType);
  }

  if (params.active !== undefined && params.active !== "") {
    query.append("active", params.active);
  }

  const queryString = query.toString();

  const response = await apiRequest(
    `/admin/pricing${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return response.data || response;
};


export const getAdminPricingRuleById = async (id) => {
  const response = await apiRequest(`/admin/pricing/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};


export const createAdminPricingRule = async (data) => {
  const response = await apiRequest("/admin/pricing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  return response.data || response;
};


export const updateAdminPricingRule = async (id, data) => {
  const response = await apiRequest(`/admin/pricing/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  return response.data || response;
};


export const updateAdminPricingRuleStatus = async (id, is_active) => {
  const response = await apiRequest(`/admin/pricing/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ is_active }),
  });

  return response.data || response;
};