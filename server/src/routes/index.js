const express = require("express");

const packageRoutes = require("./packageRoutes");
const experienceRoutes = require("./experienceRoutes");
const galleryRoutes = require("./galleryRoutes");
const bookingRoutes = require("./bookingRoutes");
const paymentRoutes = require("./paymentRoutes");
const adminRoutes = require("./adminRoutes");
const customerAuthRoutes = require("./customerAuthRoutes");
const customerRoutes = require("./customerRoutes");
const customerPaymentRoutes =
  require("./customerPaymentRoutes");
  const customerCancellationRoutes =
  require("./customerCancellationRoutes");
  const adminUploadRoutes =
  require("./adminUploadRoutes");
  const adminPackageImageRoutes =
  require("./adminPackageImageRoutes");
  const adminGalleryRoutes =
  require("./adminGalleryRoutes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "You Never See Camp API",
  });
});

router.use("/packages", packageRoutes);
router.use("/experiences", experienceRoutes);
router.use("/gallery", galleryRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use(
  "/customer/auth",
  customerAuthRoutes
);
router.use(
  "/customer",
  customerRoutes
);
router.use(
  "/customer",
  customerPaymentRoutes
);

router.use(
  "/customer",
  customerCancellationRoutes
);

router.use(
  "/admin/uploads",
  adminUploadRoutes
);

router.use(
  "/admin",
  adminPackageImageRoutes
);  

router.use(
  "/admin",
  adminGalleryRoutes
);


module.exports = router;