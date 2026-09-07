import {apiRequest} from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
}

export const getAdminSettings = async () => {
  const response = await apiRequest("/admin/settings", {
    method: "GET",  
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data || response;
};

export const updateAdminSetting = async (settingKey, settingValue) => {
  const response = await apiRequest(
    `/admin/settings/${encodeURIComponent(settingKey)}`,
    {
      method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      body: JSON.stringify({
        settingValue,
      }),
    }
  );

  return response.data || response;
};