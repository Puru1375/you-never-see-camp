require("dotenv").config();

const app = require("./app");
const {
  testDatabaseConnection,
} = require("./config/database");
const {
  expirePendingBookings,
} = require("./services/bookingCleanupService");
const {
  expireStalePayments,
} = require("./services/paymentCleanupService");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(
        `API running on http://localhost:${PORT}`
      );

      /*
       * Run once when the server starts.
       */
      expirePendingBookings().catch((error) => {
        console.error(
          "Initial booking cleanup failed:",
          error
        );
      });

      expireStalePayments().catch((error) => {
        console.error(
            "Initial payment cleanup failed:",
            error
        );
        });

      /*
       * Run every 5 minutes.
       */
      setInterval(() => {
        expirePendingBookings().catch((error) => {
          console.error(
            "Booking cleanup failed:",
            error
          );
        });

        expireStalePayments().catch((error) => {
            console.error(
            "Payment cleanup failed:",
            error
            );
        });
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();