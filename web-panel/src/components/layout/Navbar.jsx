// components/Navbar.jsx
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Download,
  Menu,
  ShoppingBag,
  UserRound,
  X,
  Store,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import MobileMenu from "./MobileMenu";
import brandLogo from "../../assets/logo/MainBrandLogo.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Explore", href: "#explore", hasDropdown: true },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Riders", href: "#riders" },
];

const exploreLinks = [
  {
    label: "Restaurants",
    description: "Explore nearby restaurants",
    href: "#restaurants",
    emoji: "🍽️",
  },
  {
    label: "Popular Food",
    description: "Discover trending dishes",
    href: "#popular-food",
    emoji: "🔥",
  },
  {
    label: "Offers",
    description: "View discounts and deals",
    href: "#offers",
    emoji: "🏷️",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = navLinks
        .map((link) => document.querySelector(link.href))
        .filter(Boolean);

      let currentSection = "home";

      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 150) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavigation = (target) => {
    setExploreOpen(false);
    setMobileOpen(false);

    if (target.startsWith("/")) {
      // It's a route path
      navigate(target);
    } else {
      // It's an anchor link
      const section = document.querySelector(target);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };
  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200/50 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            : "border-b border-transparent bg-white/70 backdrop-blur-md"
        }`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-[68px]" : "h-20"
            }`}
          >
            {/* Logo */}
            <button
              type="button"
              onClick={() => handleNavigation("#home")}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="relative flex items-center justify-center">
                <img
                  src={brandLogo}
                  alt="FoodMitra"
                  className="object-contain w-auto transition-transform duration-200 h-25 group-hover:scale-105"
                  style={{
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.06))",
                  }}
                />
                <span className="absolute w-5 h-5 rounded-full -right-1 -top-1 bg-orange-300/40 blur-md" />
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="items-center hidden gap-1 lg:flex">
              {navLinks.map((link) => {
                const sectionName = link.href.replace("#", "");
                const isActive = activeSection === sectionName;

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setExploreOpen(true)}
                      onMouseLeave={() => setExploreOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigation(link.href)}
                        className={`relative flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? "text-orange-600"
                            : "text-gray-600 hover:text-orange-600"
                        }`}
                      >
                        {link.label}

                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            exploreOpen ? "rotate-180" : ""
                          }`}
                        />

                        {isActive && (
                          <motion.span
                            layoutId="navbar-active-section"
                            className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-orange-500"
                          />
                        )}
                      </button>

                      <AnimatePresence>
                        {exploreOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className="absolute pt-3 -translate-x-1/2 left-1/2 top-full w-72"
                          >
                            <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-sm p-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
                              {exploreLinks.map((item) => (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    handleNavigation(item.href);
                                  }}
                                  className="flex items-center gap-3 p-3 transition-colors group rounded-xl hover:bg-orange-50"
                                >
                                  <span className="flex items-center justify-center w-10 h-10 text-lg transition-transform bg-orange-100 rounded-xl group-hover:scale-105">
                                    {item.emoji}
                                  </span>

                                  <span>
                                    <span className="block text-sm font-bold text-gray-800 group-hover:text-orange-600">
                                      {item.label}
                                    </span>

                                    <span className="mt-0.5 block text-xs text-gray-500">
                                      {item.description}
                                    </span>
                                  </span>
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavigation(link.href);
                    }}
                    className={`relative rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-orange-600"
                        : "text-gray-600 hover:text-orange-600"
                    }`}
                  >
                    {link.label}

                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-section"
                        className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-orange-500"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-3">
              {/* Download App */}
              <Button
                variant="primary"
                className="group rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              >
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                Download App
              </Button>

              {/* Partner Login (always visible) */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 border border-orange-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
                >
                  <UserRound className="w-4 h-4" />
                  Sign In
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 z-50 w-56 p-2 mt-2 transition-all duration-200 translate-y-1 border border-gray-100 shadow-2xl opacity-0 pointer-events-none top-full rounded-2xl bg-white/95 backdrop-blur-md group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleNavigation("/vendor/login")}
                    className="flex items-center w-full gap-3 px-3 py-3 text-sm text-left text-gray-700 transition rounded-xl hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Store className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">Vendor Login</p>
                      <p className="text-[11px] text-gray-400">
                        Manage your business
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigation("/admin/login")}
                    className="flex items-center w-full gap-3 px-3 py-3 text-sm text-left text-gray-700 transition rounded-xl hover:bg-orange-50 hover:text-orange-600"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">Admin Login</p>
                      <p className="text-[11px] text-gray-400">
                        Manage the platform
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((previous) => !previous)}
              className="relative flex items-center justify-center text-gray-800 transition-colors bg-white border border-gray-200 shadow-sm h-11 w-11 rounded-xl hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            navLinks={navLinks}
            onNavigate={handleNavigation}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
