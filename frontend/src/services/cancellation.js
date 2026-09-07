import {apiRequest} from "./api";

export const getCancellationPreview = async (
  bookingReference,
  customerDetails
) => {
  const response = await apiRequest(
    `/bookings/${encodeURIComponent(
      bookingReference
    )}/cancellation-preview`,
    {
      method: "POST",
      body: JSON.stringify(customerDetails),
    }
  );

  return response.data || response;
};

export const cancelBooking = async (
  bookingReference,
  customerDetails
) => {
  const response = await apiRequest(
    `/bookings/${encodeURIComponent(
      bookingReference
    )}/cancel`,
    {
      method: "POST",
      body: JSON.stringify(customerDetails),
    }
  );

  return response.data || response;
};