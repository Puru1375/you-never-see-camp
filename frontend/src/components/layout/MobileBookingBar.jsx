import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const MobileBookingBar = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-earth-900/10 bg-white/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">

      <Link
        to="/booking"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-fire-500 px-5 py-3.5 text-sm font-bold text-white"
      >
        Book Your Camping Experience

        <ArrowRight size={17} />
      </Link>

    </div>
  );
};

export default MobileBookingBar;