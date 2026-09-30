// pages/Home/AppExperience.jsx  (jahan ye file hai)
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Download,
  MapPin,
  Navigation,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  X,
  ChevronDown,
  Smartphone,
  Bike,
  UtensilsCrossed,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import SectionHeading from "../../components/common/SectionHeading";
import PhoneMockup from "../../components/common/PhoneMockup";
import Button from "../../components/common/Button";

// ✅ APK URLs — files `public/` folder me rakho
const customerApk = "/foodmitra-customer.apk";
const deliveryApk = "/foodmitra-delivery.apk";

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

const features = [
  { title: "Discover nearby food", description: "Find restaurants near you" },
  { title: "Smart search", description: "Search food and restaurants" },
  { title: "Easy checkout", description: "Place orders in a few taps" },
  { title: "Secure payments", description: "Multiple protected options" },
  { title: "Real-time status", description: "Receive instant order updates" },
  { title: "Live rider tracking", description: "Follow your rider on the map" },
  { title: "Order history", description: "Quickly reorder favourites" },
  { title: "Ratings and reviews", description: "Choose trusted restaurants" },
];

const foodCategories = [
  {
    name: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Biryani",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=200&q=80",
  },
];

const menuItems = [
  {
    name: "Cheese Burger",
    price: "₹149",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Farmhouse Pizza",
    price: "₹249",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80",
  },
];

/* =========================================================
   PHONE SCREENS (Home, Restaurant, Tracking) — same as before
========================================================== */
function HomeScreen() {
  return (
    <div className="h-full overflow-hidden bg-[#f8f8f8] text-gray-900">
      <div className="px-3 pt-4 pb-5 text-white bg-gradient-to-br from-orange-500 to-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[7px] text-white/75">Delivering to</p>
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />
              <span className="text-[9px] font-bold">Home, Nagod</span>
            </div>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold backdrop-blur">
            RS
          </div>
        </div>
        <p className="mt-3 text-[13px] font-extrabold leading-tight">
          What would you like
          <br />
          to eat today?
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-gray-400 shadow-sm">
          <Search className="w-3 h-3" />
          <span className="text-[7px]">Search food or restaurant</span>
        </div>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-extrabold">Popular categories</p>
          <span className="text-[7px] font-semibold text-orange-500">
            View all
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {foodCategories.map((item) => (
            <div
              key={item.name}
              className="rounded-xl bg-white p-1.5 text-center shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="object-cover w-full h-10 rounded-lg"
              />
              <p className="mt-1 text-[7px] font-bold">{item.name}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-extrabold">Nearby restaurants</p>
            <span className="text-[7px] text-orange-500">See all</span>
          </div>
          <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4f77?auto=format&fit=crop&w=500&q=80"
              alt="Restaurant"
              className="object-cover w-full h-20"
            />
            <div className="p-2">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-extrabold">The Food Corner</p>
                <span className="flex items-center gap-0.5 rounded bg-green-500 px-1 py-0.5 text-[6px] font-bold text-white">
                  4.8
                  <Star className="h-1.5 w-1.5 fill-white" />
                </span>
              </div>
              <p className="mt-1 text-[6px] text-gray-400">
                Burger • Pizza • Fast Food
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[6px] text-gray-500">
                <span className="flex items-center gap-0.5">
                  <Clock3 className="w-2 h-2" />
                  25 min
                </span>
                <span>•</span>
                <span>1.2 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantScreen() {
  return (
    <div className="h-full overflow-hidden bg-[#f8f8f8] text-gray-900">
      <div className="relative h-36">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
          alt="Restaurant food"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/20" />
        <div className="absolute text-white bottom-3 left-3 right-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[13px] font-extrabold">Spice Kitchen</p>
              <p className="mt-0.5 text-[6px] text-white/75">
                Indian • Chinese • Fast Food
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-md bg-green-500 px-1.5 py-1 text-[7px] font-bold">
              4.8
              <Star className="w-2 h-2 fill-white" />
            </span>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between text-[6px] text-gray-500">
          <span className="flex items-center gap-1">
            <Clock3 className="h-2.5 w-2.5 text-orange-500" />
            20–30 min
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-orange-500" />
            1.5 km
          </span>
          <span className="font-bold text-green-600">Free delivery</span>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-2 flex gap-1.5 overflow-hidden">
          {["Popular", "Burger", "Pizza"].map((category, index) => (
            <span
              key={category}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[6px] font-bold ${
                index === 0
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 bg-white text-gray-500"
              }`}
            >
              {category}
            </span>
          ))}
        </div>
        <p className="mb-2 text-[9px] font-extrabold">Popular dishes</p>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="flex gap-2 p-2 bg-white shadow-sm rounded-xl"
            >
              <img
                src={item.image}
                alt={item.name}
                className="object-cover rounded-lg h-14 w-14"
              />
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <p className="truncate text-[8px] font-extrabold">
                    {item.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-0.5 text-[6px] text-gray-400">
                    <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                    {item.rating}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-extrabold">{item.price}</p>
                  <button className="rounded-md border border-orange-500 px-2 py-0.5 text-[6px] font-bold text-orange-500">
                    ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute flex items-center justify-between px-3 py-2 text-white bg-gray-900 shadow-xl inset-x-3 bottom-4 rounded-xl">
        <div>
          <p className="text-[6px] text-white/60">2 items</p>
          <p className="text-[8px] font-extrabold">₹398</p>
        </div>
        <span className="flex items-center gap-1 text-[7px] font-bold">
          View cart
          <ShoppingBag className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

function TrackingScreen() {
  return (
    <div className="relative h-full overflow-hidden bg-[#e8eee8] text-gray-900">
      <div className="absolute inset-0 bg-[linear-gradient(35deg,transparent_46%,rgba(255,255,255,0.9)_47%,rgba(255,255,255,0.9)_52%,transparent_53%),linear-gradient(-35deg,transparent_42%,rgba(255,255,255,0.75)_43%,rgba(255,255,255,0.75)_48%,transparent_49%)] bg-[length:75px_75px]" />
      <div className="absolute border-2 border-dashed rounded-full left-4 top-20 h-28 w-28 border-orange-400/60 bg-orange-200/20" />
      <div className="absolute left-[47%] top-[42%]">
        <div className="relative flex items-center justify-center text-white bg-orange-500 rounded-full shadow-lg h-9 w-9 shadow-orange-500/40">
          <Navigation className="w-4 h-4 fill-white" />
          <span className="absolute rounded-full -inset-2 -z-10 animate-ping bg-orange-400/30" />
        </div>
      </div>
      <div className="absolute flex items-center justify-center w-8 h-8 text-white bg-gray-900 rounded-full shadow-lg right-6 top-24">
        <MapPin className="h-3.5 w-3.5" />
      </div>
      <div className="absolute inset-x-0 top-0 px-3 pt-4 pb-3 bg-white/90 backdrop-blur">
        <p className="text-[7px] font-semibold text-orange-500">
          Order #FD1024
        </p>
        <div className="flex items-center justify-between mt-1">
          <div>
            <p className="text-[12px] font-extrabold">
              Your food is on the way
            </p>
            <p className="mt-0.5 text-[6px] text-gray-400">
              Arriving in approximately 12 minutes
            </p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
            🛵
          </div>
        </div>
      </div>
      <div className="absolute p-3 bg-white shadow-2xl inset-x-2 bottom-2 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            alt="Delivery rider"
            className="object-cover rounded-full h-9 w-9"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-extrabold">Aman Patel</p>
            <p className="mt-0.5 text-[6px] text-gray-400">
              Your delivery partner
            </p>
          </div>
          <button className="flex items-center justify-center text-orange-500 bg-orange-100 rounded-full h-7 w-7">
            ☎
          </button>
        </div>
        <div className="flex items-center my-3">
          <div className="h-2.5 w-2.5 rounded-full border-[3px] border-orange-500 bg-white" />
          <div className="h-0.5 flex-1 bg-orange-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-[6px] text-gray-400">Order picked up</p>
            <p className="mt-0.5 text-[7px] font-bold">9:35 PM</p>
          </div>
          <div className="text-right">
            <p className="text-[6px] text-gray-400">Estimated delivery</p>
            <p className="mt-0.5 text-[7px] font-bold text-orange-500">
              9:47 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================== */
export default function AppExperience() {
  const sectionRef = useRef(null);
  const downloadRef = useRef(null);

  const [downloadOpen, setDownloadOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrApp, setSelectedQrApp] = useState(appDownloads[0]);
  const [toast, setToast] = useState("");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [7, 0, -7]);
  const phoneScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.92, 1, 0.92],
  );
  const phoneY = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);

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

  // Lock body scroll when QR modal is open
  useEffect(() => {
    document.body.style.overflow = qrModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [qrModalOpen]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // APK download
  const handleDownload = (app) => {
    if (!app.available || !app.apk) {
      setToast(
        "🚧 Coming Soon!** This app is currently under development and will be available soon.",
      );
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

  // QR URL for the selected app
  const buildQrUrl = (app) => {
    if (!app?.apk) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}${app.apk}`;
    }
    return app.apk;
  };

  // Open QR modal with a specific app
  const openQrModal = (app = appDownloads[0]) => {
    if (!app.available) {
      setToast("🚧 Coming Soon! Ye app abhi kaam kar raha hai.");
      return;
    }
    setSelectedQrApp(app);
    setQrModalOpen(true);
  };

  return (
    <section
      id="app-experience"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#fffaf6] py-20 sm:py-24 lg:py-32"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-[450px] w-[450px] rounded-full bg-red-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_1px,transparent_1px)] bg-[size:26px_26px]" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading
          badge="The complete food experience"
          title="Everything you need, right in your pocket."
          subtitle="Discover local restaurants, order your favourite food and track every delivery from one simple app."
        />

        <div className="mt-16 grid items-center gap-16 lg:mt-24 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ─── Phones ─── */}
          <motion.div
            style={{
              rotateY,
              scale: phoneScale,
              y: phoneY,
              transformStyle: "preserve-3d",
            }}
            className="relative mx-auto flex min-h-[530px] w-full max-w-[720px] items-center justify-center"
          >
            <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-400/25 to-red-400/20 blur-3xl" />

            <motion.div
              initial={{ opacity: 0, x: 80, rotate: 0 }}
              whileInView={{ opacity: 1, x: 0, rotate: -7 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="absolute left-0 z-10 hidden origin-bottom md:block"
            >
              <PhoneMockup className="scale-[0.88] shadow-2xl">
                <HomeScreen />
              </PhoneMockup>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative z-30"
            >
              <PhoneMockup className="shadow-[0_35px_80px_rgba(249,115,22,0.25)]">
                <RestaurantScreen />
              </PhoneMockup>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute hidden p-3 border shadow-xl -right-12 top-20 rounded-2xl border-white/80 bg-white/90 backdrop-blur sm:block"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-xl">
                    <Check className="w-4 h-4 text-green-600" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-800">
                      Order confirmed
                    </p>
                    <p className="text-[8px] text-gray-400">
                      Preparing your food
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -80, rotate: 0 }}
              whileInView={{ opacity: 1, x: 0, rotate: 7 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute right-0 z-20 hidden origin-bottom md:block"
            >
              <PhoneMockup className="scale-[0.88] shadow-2xl">
                <TrackingScreen />
              </PhoneMockup>
            </motion.div>
          </motion.div>

          {/* ─── Content ─── */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600"
            >
              <ShieldCheck className="w-4 h-4" />
              Fast, simple and secure
            </motion.span>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mt-5 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl"
            >
              Your favourite local food is only a few taps away.
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="max-w-xl mt-4 text-base leading-7 text-gray-500"
            >
              Enjoy a smooth ordering experience designed to help you find,
              order and receive your food without unnecessary steps.
            </motion.p>

            <div className="grid gap-3 mt-8 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="group flex items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/80 p-3.5 shadow-sm backdrop-blur transition-shadow hover:shadow-lg hover:shadow-orange-100/60"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-gray-800 group-hover:text-orange-600">
                      {feature.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-400">
                      {feature.description}
                    </span>
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ─── Download + QR ─── */}
            <div className="flex flex-col gap-5 mt-9 sm:flex-row sm:items-center">
              {/* Download App with Dropdown */}
              <div ref={downloadRef} className="relative w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={() => setDownloadOpen((p) => !p)}
                  className="group w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3.5 shadow-lg shadow-orange-500/20 sm:w-auto"
                >
                  <Download className="w-5 h-5" />
                  Download for Android
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      downloadOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                <AnimatePresence>
                  {downloadOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full z-50 mt-2 w-[300px] sm:w-[320px]"
                    >
                      <div className="p-2 border border-gray-100 shadow-2xl rounded-2xl bg-white/95 shadow-orange-500/10 backdrop-blur-xl">
                        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Choose Your App
                        </p>

                        {appDownloads.map((app) => {
                          const Icon = app.icon;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handleDownload(app)}
                              className="flex items-center w-full gap-3 px-3 py-3 text-left transition-colors group/item rounded-xl hover:bg-orange-50"
                            >
                              <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                  app.available
                                    ? "bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-bold ${
                                    app.available
                                      ? "text-gray-800 group-hover/item:text-orange-600"
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

              {/* QR Button — opens modal */}
              <button
                type="button"
                onClick={() => openQrModal(selectedQrApp)}
                className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100"
              >
                <div className="flex items-center justify-center w-12 h-12 transition-colors bg-gray-50 rounded-xl group-hover:bg-orange-50">
                  <QrCode className="text-gray-900 w-7 h-7 group-hover:text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-orange-600">
                    Scan to download
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">Tap to open QR</p>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap items-center pt-6 mt-8 border-t border-orange-100 gap-x-6 gap-y-3">
              <div>
                <p className="text-xl font-extrabold text-gray-900">4.8/5</p>
                <p className="text-xs text-gray-400">Customer rating</p>
              </div>
              <div className="w-px bg-gray-200 h-9" />
              <div>
                <p className="text-xl font-extrabold text-gray-900">10K+</p>
                <p className="text-xs text-gray-400">App downloads</p>
              </div>
              <div className="w-px bg-gray-200 h-9" />
              <div>
                <p className="text-xl font-extrabold text-gray-900">30 min</p>
                <p className="text-xs text-gray-400">Average delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          QR MODAL
      ========================================================= */}
      <AnimatePresence>
        {qrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setQrModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-t-3xl sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-100">
                <div>
                  <p className="text-lg font-extrabold text-gray-900">
                    Scan to Download
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Open your camera and scan the QR code
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  aria-label="Close"
                  className="flex items-center justify-center text-gray-500 w-9 h-9 rounded-xl hover:bg-orange-50 hover:text-orange-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* App selector */}
              <div className="p-4 space-y-2 border-b border-gray-100">
                <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Choose App
                </p>

                {appDownloads.map((app) => {
                  const Icon = app.icon;
                  const isSelected = selectedQrApp?.id === app.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      disabled={!app.available}
                      onClick={() => app.available && setSelectedQrApp(app)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isSelected
                          ? "border-orange-300 bg-orange-50 shadow-sm"
                          : app.available
                            ? "border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                            : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          app.available
                            ? isSelected
                              ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                              : "bg-orange-100 text-orange-600"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            app.available ? "text-gray-800" : "text-gray-500"
                          }`}
                        >
                          {app.title}
                        </p>
                        <p className="truncate text-[11px] text-gray-400">
                          {app.subtitle}
                        </p>
                      </div>
                      {isSelected && app.available && (
                        <Check className="w-5 h-5 text-orange-500" />
                      )}
                      {!app.available && (
                        <span className="rounded-full bg-gray-400 px-2 py-0.5 text-[10px] font-bold text-white">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* QR Code */}
              <div className="p-6 text-center">
                {selectedQrApp?.available ? (
                  <>
                    <motion.div
                      key={selectedQrApp.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="inline-block p-4 shadow-inner rounded-3xl bg-gradient-to-br from-orange-100 to-red-100"
                    >
                      <div className="p-4 bg-white shadow-sm rounded-2xl">
                        <QRCodeSVG
                          value={buildQrUrl(selectedQrApp)}
                          size={200}
                          level="M"
                          fgColor="#111827"
                          bgColor="#ffffff"
                        />
                      </div>
                    </motion.div>

                    <p className="mt-4 text-sm font-bold text-gray-800">
                      {selectedQrApp.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Scan this QR with your phone camera to download
                    </p>
                  </>
                ) : (
                  <div className="py-8">
                    <p className="text-sm text-gray-500">
                      Select an available app to see its QR
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          TOAST
      ========================================================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 px-4"
          >
            <div className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gray-900 shadow-2xl rounded-2xl">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
