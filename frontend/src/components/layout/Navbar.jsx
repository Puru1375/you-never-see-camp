import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../common/Container";
import Button from "../common/Button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    { name: "My Bookings", path: "/my-bookings" },
    // { name: "Experiences", path: "/experiences" },
    { name: "Gallery", path: "/gallery" },
        // { name: "About", path: "/about" },
        // { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <Container>
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-forest-950/70 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">

          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="You Never See Camp"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}

            <Link to="/booking">
  <Button
    showIcon={false}
    className="px-5 py-3"
  >
    Book Now
  </Button>
</Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-forest-950/95 p-5 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to="/booking"
                onClick={() => setMobileOpen(false)}
                className="mt-2"
              >
                <Button className="w-full">
                  Book Your Experience
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Navbar;