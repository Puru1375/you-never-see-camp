const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  helmet()
);

// Enable CORS for multiple origins
const allowedOrigins = [
  "https://www.devplatform.click",
  "https://devplatform.click",
  "https://you-never-see-camp.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

app.use("/api", apiRoutes);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const cancellationRoutes = require(
  "./routes/cancellationRoutes"
);

app.use(
  "/api",
  cancellationRoutes
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "You Never See Camp API is running",
    environment: process.env.NODE_ENV,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;