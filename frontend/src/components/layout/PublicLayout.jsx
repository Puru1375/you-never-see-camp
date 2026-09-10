import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "../common/ScrollToTop";
import MobileBookingBar from "./MobileBookingBar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen">
      <ScrollToTop />

      <Navbar />

      <Outlet />

      <Footer />

      {/* <MobileBookingBar /> */}
    </div>
  );
};

export default PublicLayout;