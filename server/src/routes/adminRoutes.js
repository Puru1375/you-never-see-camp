const express = require("express");

const {
  loginAdmin,
  getCurrentAdmin,
    getAdminDashboard,
    getAdminBookings,
  getAdminBookingById,
    updateAdminBookingStatus,
    getAdminPackages,
getAdminPackageById,
createAdminPackage,
updateAdminPackage,
updateAdminPackageStatus,
getAdminPricingRules,
  getAdminPricingRuleById,
  createAdminPricingRule,
  updateAdminPricingRule,
  updateAdminPricingRuleStatus,
  getAdminTaxRules,
getAdminTaxRuleById,
createAdminTaxRule,
updateAdminTaxRule,
updateAdminTaxRuleStatus,
    getAdminSettings,
    updateAdminSetting,
    getAdminCancellationPolicies,
  getAdminCancellationPolicyById,
  createAdminCancellationPolicy,
  updateAdminCancellationPolicy,
  updateAdminCancellationPolicyStatus,
} = require("../controllers/adminController");

const {
  getRefunds,
  getRefundById,
    reconcileRefund,
} = require("../controllers/adminRefundController");

const {
  getCapacity,
} = require("../controllers/adminCapacityController");

const {
  requireAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

router.post("/login", loginAdmin);

router.get(
  "/me",
  requireAdmin,
  getCurrentAdmin
);

router.get(
  "/dashboard",
  requireAdmin,
  getAdminDashboard
);

router.get(
  "/bookings",
  requireAdmin,
  getAdminBookings
);

router.get(
  "/bookings/:id",
  requireAdmin,
  getAdminBookingById
);

router.patch(
  "/bookings/:id/status",
  express.json(),
  requireAdmin,
  updateAdminBookingStatus
);

router.get(
  "/packages",
  requireAdmin,
  getAdminPackages
);

router.get(
  "/packages/:id",
  requireAdmin,
  getAdminPackageById
);

router.post(
  "/packages",
  express.json(),
  requireAdmin,
  createAdminPackage
);

router.put(
  "/packages/:id",
  express.json(),
  requireAdmin,
  updateAdminPackage
);

router.patch(
  "/packages/:id/status",
  express.json(),
  requireAdmin,
  updateAdminPackageStatus
);

router.get("/pricing", requireAdmin, getAdminPricingRules);

router.get(
  "/pricing/:id",
  requireAdmin,
  getAdminPricingRuleById
);

router.post(
  "/pricing",
  requireAdmin,
  createAdminPricingRule
);

router.put(
  "/pricing/:id",
  requireAdmin,
  updateAdminPricingRule
);

router.patch(
  "/pricing/:id/status",
  requireAdmin,
  updateAdminPricingRuleStatus
);

router.get(
  "/tax",
  requireAdmin,
  getAdminTaxRules
);

router.get(
  "/tax/:id",
  requireAdmin,
  getAdminTaxRuleById
);

router.post(
  "/tax",
  requireAdmin,
  createAdminTaxRule
);

router.put(
  "/tax/:id",
  requireAdmin,
  updateAdminTaxRule
);

router.patch(
  "/tax/:id/status",
  requireAdmin,
  updateAdminTaxRuleStatus
);

router.get("/settings", requireAdmin, getAdminSettings);

router.put(
  "/settings/:settingKey",
  requireAdmin,
  updateAdminSetting
);

router.get(
  "/cancellation-policies",
  requireAdmin,
  getAdminCancellationPolicies
);

router.get(
  "/cancellation-policies/:id",
  requireAdmin,
  getAdminCancellationPolicyById
);

router.post(
  "/cancellation-policies",
  requireAdmin,
  createAdminCancellationPolicy
);

router.put(
  "/cancellation-policies/:id",
  requireAdmin,
  updateAdminCancellationPolicy
);

router.patch(
  "/cancellation-policies/:id/status",
  requireAdmin,
  updateAdminCancellationPolicyStatus
);

router.get(
  "/refunds",
  requireAdmin,
  getRefunds
);

router.get(
  "/refunds/:id",
  requireAdmin,
  getRefundById
);

router.post(
  "/refunds/:id/reconcile",
  requireAdmin,
  reconcileRefund
);

router.get(
  "/capacity",
  requireAdmin,
  getCapacity
);


module.exports = router;