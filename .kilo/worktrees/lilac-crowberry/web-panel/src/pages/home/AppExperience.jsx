import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
} from "lucide-react";

import SectionHeading from "../../components/common/SectionHeading";
import PhoneMockup from "../../components/common/PhoneMockup";
import Button from "../../components/common/Button";

const features = [
  {
    title: "Discover nearby food",
    description: "Find restaurants near you",
  },
  {
    title: "Smart search",
    description: "Search food and restaurants",
  },
  {
    title: "Easy checkout",
    description: "Place orders in a few taps",
  },
  {
    title: "Secure payments",
    description: "Multiple protected options",
  },
  {
    title: "Real-time status",
    description: "Receive instant order updates",
  },
  {
    title: "Live rider tracking",
    description: "Follow your rider on the map",
  },
  {
    title: "Order history",
    description: "Quickly reorder favourites",
  },
  {
    title: "Ratings and reviews",
    description: "Choose trusted restaurants",
  },
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
      {/* Temporary map-style background */}
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

export default function AppExperience() {
  const sectionRef = useRef(null);

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
          {/* Phones */}
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

            {/* Left phone */}
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

            {/* Center phone */}
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

            {/* Right phone */}
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

          {/* Content */}
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
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                  }}
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

            <div className="flex flex-col gap-5 mt-9 sm:flex-row sm:items-center">
              <Button
                variant="primary"
                className="group rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3.5 shadow-lg shadow-orange-500/20"
              >
                <Download className="w-5 h-5" />
                Download for Android
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-white border border-gray-200 shadow-sm h-14 w-14 rounded-xl">
                  <QrCode className="w-10 h-10 text-gray-900" />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Scan to download
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Available on Android
                  </p>
                </div>
              </div>
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
    </section>
  );
}
