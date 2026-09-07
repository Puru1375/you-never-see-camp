import { apiRequest } from "./api";

export const checkAvailability = ({
  packageId,
  date,
  adults,
  children,
  infants,
}) => {
  const params = new URLSearchParams({
    packageId,
    date,
    adults: String(adults),
    children: String(children),
    infants: String(infants),
  });

  return apiRequest(
    `/bookings/availability?${params.toString()}`
  );
};

export const getBookingQuote = ({
  packageId,
  adults,
  children,
  infants,
}) => {
  return apiRequest("/bookings/quote", {
    method: "POST",
    body: JSON.stringify({
      packageId,
      adults,
      children,
      infants,
    }),
  });
};

export const createBooking = ({
  packageId,
  customerName,
  phone,
  email,
  bookingDate,
  adults,
  children,
  infants,
  specialRequests,
}) => {
  return apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify({
      packageId,
      customerName,
      phone,
      email,
      bookingDate,
      adults,
      children,
      infants,
      specialRequests,
    }),
  });
};

export const getBookingByReference = (reference) => {
  return apiRequest(
    `/bookings/reference/${encodeURIComponent(reference)}`
  );
};