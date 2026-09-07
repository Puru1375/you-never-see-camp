const { sendEmail } = require("./emailService");

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatMoney = (amount) => {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const createBookingConfirmationHtml = (booking) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f5f1e8;
            font-family: Arial, Helvetica, sans-serif;
            color: #243127;
          }

          .wrapper {
            width: 100%;
            padding: 40px 16px;
            box-sizing: border-box;
          }

          .container {
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
          }

          .header {
            background: #092118;
            padding: 32px;
            text-align: center;
            color: #ffffff;
          }

          .header h1 {
            margin: 0;
            font-size: 28px;
          }

          .header p {
            margin: 10px 0 0;
            color: #d5ddd8;
          }

          .content {
            padding: 32px;
          }

          .success {
            text-align: center;
            font-size: 44px;
            margin-bottom: 16px;
          }

          .reference {
            background: #f5f1e8;
            border-radius: 14px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
          }

          .reference-label {
            color: #777;
            font-size: 13px;
          }

          .reference-value {
            margin-top: 8px;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .section {
            margin-top: 28px;
          }

          .section h2 {
            font-size: 18px;
            margin-bottom: 14px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 10px 0;
            border-bottom: 1px solid #eeeeee;
          }

          .label {
            color: #777777;
          }

          .value {
            font-weight: 600;
            text-align: right;
          }

          .total {
            margin-top: 20px;
            padding: 18px;
            background: #092118;
            color: white;
            border-radius: 14px;
            display: flex;
            justify-content: space-between;
            font-weight: bold;
          }

          .footer {
            padding: 24px 32px;
            background: #f8f8f8;
            text-align: center;
            color: #777;
            font-size: 13px;
            line-height: 1.6;
          }

          @media (max-width: 600px) {
            .content {
              padding: 24px;
            }

            .header {
              padding: 26px 20px;
            }

            .row {
              flex-direction: column;
              gap: 4px;
            }

            .value {
              text-align: left;
            }
          }
        </style>
      </head>

      <body>
        <div class="wrapper">

          <div class="container">

            <div class="header">
              <h1>You Never See Camp</h1>
              <p>Your adventure is confirmed 🌲</p>
            </div>

            <div class="content">

              <div class="success">✓</div>

              <h2 style="text-align:center;">
                Booking Confirmed!
              </h2>

              <p>
                Hi ${booking.customer_name},
              </p>

              <p>
                Thank you for choosing You Never See Camp.
                Your camping experience has been successfully booked.
              </p>

              <div class="reference">
                <div class="reference-label">
                  Booking Reference
                </div>

                <div class="reference-value">
                  ${booking.booking_reference}
                </div>
              </div>

              <div class="section">
                <h2>Booking Details</h2>

                <div class="row">
                  <span class="label">Package</span>
                  <span class="value">
                    ${booking.package_name}
                  </span>
                </div>

                <div class="row">
                  <span class="label">Date</span>
                  <span class="value">
                    ${formatDate(booking.booking_date)}
                  </span>
                </div>

                <div class="row">
                  <span class="label">Guests</span>
                  <span class="value">
                    ${booking.adults} Adult(s)
                    ${
                      booking.children > 0
                        ? `, ${booking.children} Child(ren)`
                        : ""
                    }
                    ${
                      booking.infants > 0
                        ? `, ${booking.infants} Infant(s)`
                        : ""
                    }
                  </span>
                </div>

                <div class="row">
                  <span class="label">Check-in</span>
                  <span class="value">
                    ${booking.check_in_time || "2:00 PM"}
                  </span>
                </div>

                <div class="row">
                  <span class="label">Check-out</span>
                  <span class="value">
                    ${booking.check_out_time || "11:00 AM"}
                  </span>
                </div>

              </div>

              <div class="total">
                <span>Total Paid</span>
                <span>
                  ${formatMoney(booking.total_amount)}
                </span>
              </div>

              <div class="section">
                <h2>Location</h2>

                <p>
                  📍 7 Hills of Jungle
                </p>
              </div>

              <p style="margin-top:32px;">
                We look forward to welcoming you.
                Get ready for an unforgettable experience in nature! 🌲🔥
              </p>

            </div>

            <div class="footer">
              <strong>You Never See Camp</strong><br />
              7 Hills of Jungle<br />
              Phone: 8849976804<br />
              Email: youneverseecamp@gmail.com
            </div>

          </div>

        </div>
      </body>
    </html>
  `;
};

const sendBookingConfirmationEmail = async (booking) => {
  if (!booking.customer_email) {
    return null;
  }

  return sendEmail({
    to: booking.customer_email,
    subject: `Booking Confirmed — ${booking.booking_reference}`,
    html: createBookingConfirmationHtml(booking),
    idempotencyKey: `booking-confirmation/${booking.booking_reference}`,
  });
};

const createAdminBookingHtml = (booking) => {
  return `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 650px;
      margin: auto;
      padding: 30px;
      color: #243127;
    ">

      <h1>
        New Booking Received
      </h1>

      <p>
        A new booking has been successfully paid and confirmed.
      </p>

      <hr />

      <h2>Booking</h2>

      <p>
        <strong>Reference:</strong>
        ${booking.booking_reference}
      </p>

      <p>
        <strong>Package:</strong>
        ${booking.package_name}
      </p>

      <p>
        <strong>Date:</strong>
        ${formatDate(booking.booking_date)}
      </p>

      <p>
        <strong>Guests:</strong>
        ${booking.adults} Adult(s),
        ${booking.children} Child(ren),
        ${booking.infants} Infant(s)
      </p>

      <h2>Customer</h2>

      <p>
        <strong>Name:</strong>
        ${booking.customer_name}
      </p>

      <p>
        <strong>Phone:</strong>
        ${booking.customer_phone}
      </p>

      <p>
        <strong>Email:</strong>
        ${booking.customer_email || "Not provided"}
      </p>

      <h2>Payment</h2>

      <p>
        <strong>Status:</strong> ${booking.status}
      </p>

      <p>
        <strong>Total:</strong>
        ${formatMoney(booking.total_amount)}
      </p>

      ${
        booking.special_requests
          ? `
            <h2>Special Requests</h2>
            <p>${booking.special_requests}</p>
          `
          : ""
      }

      <hr />

      <p>
        You Never See Camp
      </p>

    </div>
  `;
};

const sendAdminBookingNotification = async (booking) => {
  if (!process.env.ADMIN_EMAIL) {
    return null;
  }

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Booking — ${booking.booking_reference}`,
    html: createAdminBookingHtml(booking),
    idempotencyKey: `admin-booking/${booking.booking_reference}`,
  });
};

const createCancellationEmailHtml = (booking, refund) => {
  const refundAmount = formatMoney(refund.amount);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f5f1e8;
            font-family: Arial, Helvetica, sans-serif;
            color: #243127;
          }

          .wrapper {
            width: 100%;
            padding: 40px 16px;
            box-sizing: border-box;
          }

          .container {
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
          }

          .header {
            background: #092118;
            padding: 32px;
            text-align: center;
            color: #ffffff;
          }

          .header h1 {
            margin: 0;
            font-size: 28px;
          }

          .header p {
            margin: 10px 0 0;
            color: #d5ddd8;
          }

          .content {
            padding: 32px;
          }

          .cancelled {
            text-align: center;
            font-size: 44px;
            margin-bottom: 16px;
          }

          .reference {
            background: #f5f1e8;
            border-radius: 14px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
          }

          .reference-label {
            color: #777;
            font-size: 13px;
          }

          .reference-value {
            margin-top: 8px;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .section {
            margin-top: 28px;
          }

          .section h2 {
            font-size: 18px;
            margin-bottom: 14px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 10px 0;
            border-bottom: 1px solid #eeeeee;
          }

          .label {
            color: #777777;
          }

          .value {
            font-weight: 600;
            text-align: right;
          }

          .refund {
            margin-top: 24px;
            padding: 20px;
            background: #092118;
            color: white;
            border-radius: 14px;
          }

          .refund-row {
            display: flex;
            justify-content: space-between;
            padding: 7px 0;
          }

          .footer {
            padding: 24px 32px;
            background: #f8f8f8;
            text-align: center;
            color: #777;
            font-size: 13px;
            line-height: 1.6;
          }

          @media (max-width: 600px) {
            .content {
              padding: 24px;
            }

            .header {
              padding: 26px 20px;
            }

            .row {
              flex-direction: column;
              gap: 4px;
            }

            .value {
              text-align: left;
            }
          }
        </style>
      </head>

      <body>
        <div class="wrapper">
          <div class="container">

            <div class="header">
              <h1>You Never See Camp</h1>
              <p>Your booking has been cancelled</p>
            </div>

            <div class="content">

              <div class="cancelled">✓</div>

              <h2 style="text-align:center;">
                Booking Cancelled
              </h2>

              <p>
                Hi ${booking.customer_name},
              </p>

              <p>
                Your booking has been successfully cancelled.
              </p>

              <div class="reference">
                <div class="reference-label">
                  Booking Reference
                </div>

                <div class="reference-value">
                  ${booking.booking_reference}
                </div>
              </div>

              <div class="section">
                <h2>Booking Details</h2>

                <div class="row">
                  <span class="label">Package</span>
                  <span class="value">
                    ${booking.package_name}
                  </span>
                </div>

                <div class="row">
                  <span class="label">Date</span>
                  <span class="value">
                    ${formatDate(booking.booking_date)}
                  </span>
                </div>

                <div class="row">
                  <span class="label">Guests</span>
                  <span class="value">
                    ${booking.adults} Adult(s)
                    ${
                      booking.children > 0
                        ? `, ${booking.children} Child(ren)`
                        : ""
                    }
                    ${
                      booking.infants > 0
                        ? `, ${booking.infants} Infant(s)`
                        : ""
                    }
                  </span>
                </div>

              </div>

              <div class="refund">

                <h2 style="margin-top:0;">
                  Refund Details
                </h2>

                <div class="refund-row">
                  <span>Original Amount</span>
                  <strong>
                    ${formatMoney(booking.total_amount)}
                  </strong>
                </div>

                <div class="refund-row">
                  <span>Refund Percentage</span>
                  <strong>
                    ${refund.refund_percentage}%
                  </strong>
                </div>

                <div class="refund-row">
                  <span>Refund Amount</span>
                  <strong>
                    ${refundAmount}
                  </strong>
                </div>

                <div class="refund-row">
                  <span>Refund Status</span>
                  <strong>
                    Processed
                  </strong>
                </div>

              </div>

              ${
                refund.provider_refund_id
                  ? `
                    <p style="margin-top:24px;">
                      <strong>Refund Reference:</strong><br />
                      ${refund.provider_refund_id}
                    </p>
                  `
                  : ""
              }

              <p style="margin-top:32px;">
                The refund has been processed to your original
                payment method. The time taken for the amount to
                appear in your account depends on your bank or
                payment provider.
              </p>

            </div>

            <div class="footer">
              <strong>You Never See Camp</strong><br />
              7 Hills of Jungle<br />
              Phone: 8849976804<br />
              Email: youneverseecamp@gmail.com
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
};


const sendCancellationEmail = async (booking, refund) => {
  if (!booking.customer_email) {
    return null;
  }

  return sendEmail({
    to: booking.customer_email,
    subject: `Booking Cancelled - ${booking.booking_reference}`,
    html: createCancellationEmailHtml(
      booking,
      refund
    ),
    idempotencyKey:
      `booking-cancellation/${booking.booking_reference}`,
  });
};

const createAdminCancellationHtml = (
  booking,
  refund
) => {
  return `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 650px;
      margin: auto;
      padding: 30px;
      color: #243127;
    ">

      <h1>
        Booking Cancelled
      </h1>

      <p>
        A customer booking has been cancelled and the refund
        has been processed.
      </p>

      <hr />

      <h2>Booking</h2>

      <p>
        <strong>Reference:</strong>
        ${booking.booking_reference}
      </p>

      <p>
        <strong>Package:</strong>
        ${booking.package_name}
      </p>

      <p>
        <strong>Date:</strong>
        ${formatDate(booking.booking_date)}
      </p>

      <h2>Customer</h2>

      <p>
        <strong>Name:</strong>
        ${booking.customer_name}
      </p>

      <p>
        <strong>Phone:</strong>
        ${booking.customer_phone}
      </p>

      <p>
        <strong>Email:</strong>
        ${booking.customer_email || "Not provided"}
      </p>

      <h2>Refund</h2>

      <p>
        <strong>Original Amount:</strong>
        ${formatMoney(booking.total_amount)}
      </p>

      <p>
        <strong>Refund Percentage:</strong>
        ${refund.refund_percentage}%
      </p>

      <p>
        <strong>Refund Amount:</strong>
        ${formatMoney(refund.amount)}
      </p>

      <p>
        <strong>Refund Status:</strong>
        ${refund.status}
      </p>

      ${
        refund.provider_refund_id
          ? `
            <p>
              <strong>Razorpay Refund ID:</strong>
              ${refund.provider_refund_id}
            </p>
          `
          : ""
      }

      <hr />

      <p>
        You Never See Camp
      </p>

    </div>
  `;
};


const sendAdminCancellationNotification = async (
  booking,
  refund
) => {
  if (!process.env.ADMIN_EMAIL) {
    return null;
  }

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject:
      `Booking Cancelled - ${booking.booking_reference}`,
    html: createAdminCancellationHtml(
      booking,
      refund
    ),
    idempotencyKey:
      `admin-cancellation/${booking.booking_reference}`,
  });
};

module.exports = {
  sendBookingConfirmationEmail,
  sendAdminBookingNotification,
  sendCancellationEmail,
  sendAdminCancellationNotification,
};