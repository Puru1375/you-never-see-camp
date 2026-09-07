import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
};

export const getRefunds = async () => {
  const response = await apiRequest("/admin/refunds", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const getRefundById = async (id) => {
  const response = await apiRequest(`/admin/refunds/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const reconcileRefund = async (id) => {
  const response = await apiRequest(`/admin/refunds/${id}/reconcile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};