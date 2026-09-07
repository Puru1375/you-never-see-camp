import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBookingBar from "./MobileBookingBar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen">

      <Navbar />

      <Outlet />

      <Footer />

      <MobileBookingBar />

    </div>
  );
};

export default PublicLayout;