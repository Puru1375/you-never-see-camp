import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";

import Home from "../pages/Home";
import Packages from "../pages/Packages";
import PackageDetails from "../pages/PackageDetails";
import Experiences from "../pages/Experiences";
import ExperienceDetails from "../pages/ExperienceDetails";
import Gallery from "../pages/Gallery";
import About from "../pages/About";
import Booking from "../pages/Booking";
import BookingSuccess from "../pages/BookingSuccess";
import Contact from "../pages/Contact";
import FAQ from "../pages/FAQ";
import MyBookings from "../pages/MyBookings";


import MyBookingsVerify from "../pages/MyBookingsVerify";
import MyBookingsList from "../pages/MyBookingsList";
import MyBookingDetails from "../pages/MyBookingDetails";
import MyBookingPayment from "../pages/MyBookingPayment";
import MyBookingCancel from "../pages/MyBookingCancel";


import AdminLogin from "../admin/pages/AdminLogin";
import Dashboard from "../admin/pages/Dashboard";
import AdminLayout from "../admin/layouts/AdminLayout";
import Bookings from "../admin/pages/Bookings";
import BookingDetails from "../admin/pages/BookingDetails";
import AdminPackages from "../admin/pages/Packages";
import PackageForm from "../admin/pages/PackageForm";
import Pricing from "../admin/pages/Pricing";
import PricingForm from "../admin/pages/PricingForm";
import Tax from "../admin/pages/Tax";
import TaxForm from "../admin/pages/TaxForm";
import Settings from "../admin/pages/Settings";
import CancellationPolicies from "../admin/pages/CancellationPolicies";
import CancellationPolicyForm from "../admin/pages/CancellationPolicyForm";
import CancelBooking from "../pages/CancelBooking";
import Refunds from "../admin/pages/Refunds";
import RefundDetails from "../admin/pages/RefundDetails";
import Capacity from "../admin/pages/Capacity";
import AdminGallery from "../admin/pages/Gallery";


const AppRoutes = () => {
  return (
    <Routes>

      {/* =========================
          PUBLIC WEBSITE
      ========================= */}

      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/packages"
          element={<Packages />}
        />

        <Route
          path="/packages/:slug"
          element={<PackageDetails />}
        />

        <Route
          path="/experiences"
          element={<Experiences />}
        />

        <Route
          path="/experiences/:slug"
          element={<ExperienceDetails />}
        />

        <Route
          path="/gallery"
          element={<Gallery />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/booking"
          element={<Booking />}
        />

        <Route
          path="/booking-success"
          element={<BookingSuccess />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/faq"
          element={<FAQ />}
        />

        <Route
        path="/cancel-booking"
        element={<CancelBooking />}
        />

        <Route
        path="/my-bookings"
        element={<MyBookings />}
        />


      </Route>

        <Route
        path="/my-bookings/verify"
        element={<MyBookingsVerify />}
        />

        <Route
        path="/my-bookings/list"
        element={<MyBookingsList />}
        />

        <Route
        path="/my-bookings/:reference"
        element={<MyBookingDetails />}
        />

        <Route
        path="/my-bookings/:reference/payment"
        element={<MyBookingPayment />}
        />

        <Route
        path="/my-bookings/:reference/cancel"
        element={<MyBookingCancel />}
        />

      {/* =========================
          ADMIN LOGIN
      ========================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =========================
          ADMIN PANEL
      ========================= */}

      <Route
        element={<AdminLayout />}
      >

        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        <Route
            path="/admin/bookings"
            element={<Bookings />}
        />

        <Route
            path="/admin/bookings/:id"
            element={<BookingDetails />}
        />

        <Route path="/admin/packages" element={<AdminPackages />} />

        <Route
            path="/admin/packages/new"
            element={<PackageForm />}
        />

        <Route
        path="/admin/packages/:id/edit"
        element={<PackageForm />}
        />

        <Route
            path="/admin/pricing"
            element={<Pricing />}
        />

        <Route
            path="/admin/pricing"
            element={<Pricing />}
        />

        <Route
        path="/admin/pricing/new"
        element={<PricingForm />}
        />

        <Route
        path="/admin/pricing/:id/edit"
        element={<PricingForm />}
        />

        <Route
        path="/admin/tax"
        element={<Tax />}
        />

        <Route
        path="/admin/tax/new"
        element={<TaxForm />}
        />

        <Route
        path="/admin/tax/:id/edit"
        element={<TaxForm />}
        />

        <Route path="/admin/settings" element={<Settings />} />

        <Route
        path="/admin/cancellation-policies"
        element={<CancellationPolicies />}
        />

        <Route
        path="/admin/cancellation-policies/new"
        element={<CancellationPolicyForm />}
        />

        <Route
        path="/admin/cancellation-policies/:id/edit"
        element={<CancellationPolicyForm />}
        />

        <Route
        path="/admin/refunds"
        element={<Refunds />}
        />

        <Route
        path="/admin/refunds/:id"
        element={<RefundDetails />}
        />

        <Route
        path="/admin/capacity"
        element={<Capacity />}
        />

        <Route
        path="/admin/gallery"
        element={<AdminGallery />}
        />

      </Route>


      {/* /admin → dashboard */}

      <Route
        path="/admin"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;