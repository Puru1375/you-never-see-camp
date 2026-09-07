import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
};

export const getCapacity = async (date) => {
  const params = new URLSearchParams({ date });
  const response = await apiRequest(
    `/admin/capacity?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return response.data || response;
};