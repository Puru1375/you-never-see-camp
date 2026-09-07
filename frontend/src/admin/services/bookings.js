import { apiRequest } from "../../services/api";

const getToken = () => {
  return localStorage.getItem("admin_token");
};

export const getAdminBookings = ({
  search = "",
  status = "",
  packageId = "",
  date = "",
  page = 1,
  limit = 20,
} = {}) => {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  if (packageId) {
    params.set("packageId", packageId);
  }

  if (date) {
    params.set("date", date);
  }

  params.set("page", page);
  params.set("limit", limit);

  return apiRequest(
    `/admin/bookings?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

export const getAdminBookingById = async (id) => {
  const response = await apiRequest(`/admin/bookings/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // API response:
  // {
  //   success: true,
  //   data: {
  //     booking,
  //     guests,
  //     breakdown,
  //     payments,
  //     notifications
  //   }
  // }

  return response.data || response;
};

export const updateAdminBookingStatus = async (id, status) => {
  if (!["cancelled", "completed"].includes(status)) {
    throw new Error("A valid booking status is required");
  }

  return apiRequest(
    `/admin/bookings/${id}/status?status=${encodeURIComponent(status)}`,
    {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      status,
    }),
    }
  );
};