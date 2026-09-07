import { Link } from "react-router-dom";
import {
  MessageSquare,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Container from "../common/Container";

const Footer = () => {
  return (
    <footer className="bg-forest-950 text-white">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-2">
            <img
              src="/logo.png"
              alt="You Never See Camp"
              className="mb-5 h-24 w-auto"
            />

            <p className="max-w-md text-sm leading-7 text-white/60">
              Escape into nature, explore the trails, gather around the
              bonfire and experience unforgettable nights at 7 Hills of
              Jungle.
            </p>
          </div>

          <div>
            <h3 className="mb-5 font-semibold">
              Explore
            </h3>

            <div className="flex flex-col gap-3 text-sm text-white/60">
              <Link to="/packages">Packages</Link>
              {/* <Link to="/experiences">Experiences</Link> */}
              <Link to="/gallery">Gallery</Link>
              <Link to="/about">About Us</Link>
              <Link to="/faq">FAQ</Link>
              {/* <Link to="/contact">Contact</Link> */}
            </div>
          </div>

          <div>
            <h3 className="mb-5 font-semibold">
              Contact
            </h3>

            <div className="space-y-4 text-sm text-white/60">

              <div className="flex gap-3">
                <MapPin size={18} className="shrink-0 text-fire-500" />
                <span>7 Hills of Jungle</span>
              </div>

              <a
                href="tel:8849976804"
                className="flex gap-3"
              >
                <Phone size={18} className="shrink-0 text-fire-500" />
                <span>8849976804</span>
              </a>

              <a
                href="mailto:youneverseecamp@gmail.com"
                className="flex gap-3"
              >
                <Mail size={18} className="shrink-0 text-fire-500" />
                <span className="break-all">
                  youneverseecamp@gmail.com
                </span>
              </a>

              <div className="flex gap-3">
                <MessageSquare
                  size={18}
                  className="shrink-0 text-fire-500"
                />
                <span>Follow our journey</span>
              </div>

            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} You Never See Camp. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;