// components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  Menu,
  UserRound,
  X,
  Store,
  ShieldCheck,
  Smartphone,
  Bike,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import MobileMenu from "./MobileMenu";
import brandLogo from "../../assets/logo/MainBrandLogo.png";

// ✅ APK URLs — files `public/` folder me rakho
const customerApk = "/foodmitra-customer.apk";
const deliveryApk = "/foodmitra-delivery.apk";

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

const appDownloads = [
  {
    id: "customer",
    title: "FoodMitra App",
    subtitle: "Order food & more",
    icon: Smartphone,
    apk: customerApk,
    available: true,
  },
  {
    id: "delivery",
    title: "FoodMitra Delivery Partner",
    subtitle: "Deliver & earn",
    icon: Bike,
    apk: deliveryApk,
    available: true,
  },
  {
    id: "tiffin",
    title: "FoodMitra Tiffin House",
    subtitle: "Home-style meals",
    icon: UtensilsCrossed,
    apk: null,
    available: false,
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [toast, setToast] = useState("");

  const downloadRef = useRef(null);
  const navigate = useNavigate();

  // Scroll → shrink + active section tracking
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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close download dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleNavigation = (target) => {
    setExploreOpen(false);
    setMobileOpen(false);
    setDownloadOpen(false);

    if (target.startsWith("/")) {
      navigate(target);
    } else {
      const section = document.querySelector(target);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleDownload = (app) => {
    if (!app.available || !app.apk) {
      setToast("🚧 Coming Soon! Ye app abhi kaam kar raha hai.");
      setDownloadOpen(false);
      return;
    }

    const link = document.createElement("a");
    link.href = app.apk;
    link.download = `${app.title.replace(/\s+/g, "-").toLowerCase()}.apk`;
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-orange-100/60 bg-white/85 shadow-[0_8px_30px_rgba(249,115,22,0.08)] backdrop-blur-xl"
            : "border-b border-transparent bg-white/60 backdrop-blur-md"
        }`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-2 transition-all duration-300 ${
              scrolled ? "h-[68px]" : "h-20"
            }`}
          >
            {/* ─── Logo ─── */}
            <button
              type="button"
              onClick={() => handleNavigation("#home")}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="relative flex items-center justify-center">
                <img
                  src={brandLogo}
                  alt="FoodMitra"
                  className="object-contain w-auto transition-transform duration-200 h-14 group-hover:scale-105 sm:h-16 lg:h-18"
                  style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.06))" }}
                />
                <span className="absolute w-5 h-5 rounded-full -right-1 -top-1 bg-orange-300/40 blur-md" />
              </div>
            </button>

            {/* ─── Desktop Navigation ─── */}
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
                            <div className="rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-sm">
                              {exploreLinks.map((item) => (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  onClick={(e) => {
                                    e.preventDefault();
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
                    onClick={(e) => {
                      e.preventDefault();
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

            {/* ─── Right Side Actions ─── */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Download App (hidden on very small, shown sm+) */}
              <div
                ref={downloadRef}
                className="relative hidden sm:block"
                onMouseEnter={() => setDownloadOpen(true)}
                onMouseLeave={() => setDownloadOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setDownloadOpen((p) => !p)}
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 sm:px-4 lg:px-5 lg:text-sm"
                >
                  <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  <span className="hidden lg:inline">Download App</span>
                  <span className="hidden sm:inline lg:hidden">Download</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      downloadOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {downloadOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 pt-3 top-full w-72"
                    >
                      <div className="p-2 border border-gray-100 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md">
                        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Our Apps
                        </p>
                        {appDownloads.map((app) => {
                          const Icon = app.icon;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handleDownload(app)}
                              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-orange-50"
                            >
                              <span
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                  app.available
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-semibold ${
                                    app.available
                                      ? "text-gray-800 group-hover:text-orange-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {app.title}
                                </p>
                                <p className="truncate text-[11px] text-gray-400">
                                  {app.subtitle}
                                </p>
                              </div>
                              {app.available ? (
                                <Download className="w-4 h-4 text-orange-500" />
                              ) : (
                                <span className="rounded-full bg-gray-400 px-2 py-0.5 text-[10px] font-bold text-white">
                                  Soon
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Partner Login (hidden on very small, shown md+) */}
              <div className="relative hidden group md:block">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-2.5 text-xs font-semibold text-orange-600 shadow-sm transition-all hover:border-orange-300 hover:shadow-md sm:px-4 lg:px-5 lg:text-sm"
                >
                  <UserRound className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign In</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>

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

              {/* ─── Mobile Menu Toggle (visible until lg) ─── */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((p) => !p)}
                className="relative flex items-center justify-center text-gray-800 transition-all bg-white border border-gray-200 shadow-sm h-11 w-11 rounded-xl hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 lg:hidden"
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

                {/* Notification dot (optional) */}
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gradient line on scroll */}
        <div
          className={`h-px w-full bg-gradient-to-r from-transparent via-orange-300/60 to-transparent transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </motion.header>

      {/* ─── Mobile Menu Drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            navLinks={navLinks}
            onNavigate={handleNavigation}
            onClose={() => setMobileOpen(false)}
            appDownloads={appDownloads}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>

      {/* ─── Coming Soon Toast ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
          >
            <div className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gray-900 shadow-2xl rounded-2xl">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
