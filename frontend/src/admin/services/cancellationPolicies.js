import {apiRequest} from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
}

export const getCancellationPolicies = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.packageId) {
    query.append("packageId", params.packageId);
  }

  if (params.active !== undefined && params.active !== "") {
    query.append("active", params.active);
  }

  const queryString = query.toString();

  const response = await apiRequest(
    `/admin/cancellation-policies${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
    }
  );

  return response.data || response;
};

export const getCancellationPolicyById = async (id) => {
  const response = await apiRequest(
    `/admin/cancellation-policies/${id}`,
    {
      method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
    }
  );

  return response.data || response;
};

export const createCancellationPolicy = async (data) => {
  const response = await apiRequest(
    "/admin/cancellation-policies",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.data || response;
};

export const updateCancellationPolicy = async (id, data) => {
  const response = await apiRequest(
    `/admin/cancellation-policies/${id}`,
    {
      method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      body: JSON.stringify(data),
    }
  );

  return response.data || response;
};

export const updateCancellationPolicyStatus = async (
  id,
  isActive
) => {
  const response = await apiRequest(
    `/admin/cancellation-policies/${id}/status`,
    {
      method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      body: JSON.stringify({
        isActive,
      }),
    }
  );

  return response.data || response;
};