const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const customerRequest = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },

      ...options,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
};


export const requestCustomerOtp = ({
  bookingReference,
  email,
}) => {
  return customerRequest(
    "/customer/auth/request-otp",
    {
      method: "POST",

      body: JSON.stringify({
        bookingReference,
        email,
      }),
    }
  );
};


export const verifyCustomerOtp = ({
  bookingReference,
  email,
  otp,
}) => {
  return customerRequest(
    "/customer/auth/verify-otp",
    {
      method: "POST",

      body: JSON.stringify({
        bookingReference,
        email,
        otp,
      }),
    }
  );
};


export const getCurrentCustomer = () => {
  return customerRequest(
    "/customer/me"
  );
};


export const logoutCustomer = () => {
  return customerRequest(
    "/customer/auth/logout",
    {
      method: "POST",
    }
  );
};