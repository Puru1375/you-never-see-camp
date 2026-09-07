import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
};

export const adminLogin = ({ email, password }) => {
  return apiRequest("/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const getAdminDashboard = () => {
  const token = getToken();

  return apiRequest("/admin/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentAdmin = () => {
  const token = getToken();

  return apiRequest("/admin/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const adminLogout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
};