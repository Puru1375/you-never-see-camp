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


export const getCustomerBookings = () => {
  return customerRequest(
    "/customer/bookings"
  );
};


export const getCustomerBooking = (
  bookingReference
) => {
  return customerRequest(
    `/customer/bookings/${encodeURIComponent(
      bookingReference
    )}`
  );
};


export const getCustomerPayment = (
  bookingReference
) => {
  return customerRequest(
    `/customer/bookings/${encodeURIComponent(
      bookingReference
    )}/payment`
  );
};


export const createCustomerPaymentOrder = (
  bookingReference
) => {
  return customerRequest(
    `/customer/bookings/${encodeURIComponent(
      bookingReference
    )}/payment`,
    {
      method: "POST",
    }
  );
};


export const verifyCustomerPayment = (
  bookingReference,
  paymentData
) => {
  return customerRequest(
    `/customer/bookings/${encodeURIComponent(
      bookingReference
    )}/payment/verify`,
    {
      method: "POST",

      body: JSON.stringify(
        paymentData
      ),
    }
  );
};


export const getCancellationPreview = (
  bookingReference
) => {
  return customerRequest(
    `/customer/bookings/${encodeURIComponent(
      bookingReference
    )}/cancellation-preview`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
};


export const cancelCustomerBooking = (
  bookingReference,
  reason = null
) => {
  return customerRequest(
    `/customer/bookings/${encodeURIComponent(
      bookingReference
    )}/cancel`,
    {
      method: "POST",

      body: JSON.stringify({
        reason,
      }),
    }
  );
};