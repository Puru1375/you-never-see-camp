import { apiRequest } from "./api";

export const createPaymentOrder = (
  bookingId
) => {
  return apiRequest(
    "/payments/create-order",
    {
      method: "POST",

      body: JSON.stringify({
        bookingId,
      }),
    }
  );
};

export const verifyPayment = (
  paymentData
) => {
  return apiRequest(
    "/payments/verify",
    {
      method: "POST",

      body: JSON.stringify(
        paymentData
      ),
    }
  );
};

export const loadRazorpayScript =
  () => {
    return new Promise(
      (resolve) => {
        if (
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          )
        ) {
          resolve(true);
          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () =>
          resolve(true);

        script.onerror = () =>
          resolve(false);

        document.body.appendChild(
          script
        );
      }
    );
  };