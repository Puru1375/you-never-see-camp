const { sendEmail } = require("./emailService");

const sendCustomerOtpEmail = async ({
  email,
  customerName,
  bookingReference,
  otp,
}) => {
  const subject = `Your You Never See Camp verification code`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verification Code</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f3ed;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2933;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
          "
        >

          <div
            style="
              background: #173b2c;
              padding: 28px;
              text-align: center;
            "
          >
            <h1
              style="
                margin: 0;
                color: #ffffff;
                font-size: 24px;
              "
            >
              You Never See Camp
            </h1>

            <p
              style="
                margin: 8px 0 0;
                color: #d7dfd9;
                font-size: 14px;
              "
            >
              7 Hills of Jungle
            </p>
          </div>

          <div style="padding: 32px;">

            <p style="font-size: 16px;">
              Hi ${customerName || "there"},
            </p>

            <p
              style="
                font-size: 15px;
                line-height: 1.6;
              "
            >
              Use the verification code below to access your booking.
            </p>

            <div
              style="
                margin: 28px 0;
                padding: 20px;
                background: #f5f3ed;
                border-radius: 12px;
                text-align: center;
              "
            >
              <div
                style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 8px;
                "
              >
                VERIFICATION CODE
              </div>

              <div
                style="
                  font-size: 32px;
                  font-weight: 700;
                  letter-spacing: 8px;
                  color: #173b2c;
                "
              >
                ${otp}
              </div>
            </div>

            <p
              style="
                font-size: 14px;
                line-height: 1.6;
                color: #555;
              "
            >
              This code will expire in 5 minutes.
              Do not share this code with anyone.
            </p>

            <div
              style="
                margin-top: 24px;
                padding: 16px;
                background: #fafafa;
                border-radius: 10px;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  color: #555;
                "
              >
                Booking Reference
              </p>

              <p
                style="
                  margin: 6px 0 0;
                  font-size: 16px;
                  font-weight: 600;
                  color: #173b2c;
                "
              >
                ${bookingReference}
              </p>
            </div>

            <p
              style="
                margin-top: 28px;
                font-size: 13px;
                line-height: 1.6;
                color: #777;
              "
            >
              If you did not request this verification code,
              you can safely ignore this email.
            </p>

          </div>

          <div
            style="
              padding: 20px 32px;
              background: #fafafa;
              text-align: center;
              font-size: 12px;
              color: #777;
            "
          >
            You Never See Camp · 7 Hills of Jungle
          </div>

        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    idempotencyKey: `customer-otp-${bookingReference}-${Date.now()}`,
  });
};

module.exports = {
  sendCustomerOtpEmail,
};