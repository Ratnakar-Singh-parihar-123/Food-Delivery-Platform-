import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Download,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";

import Button from "../../components/common/Button";
import PhoneMockup from "../../components/common/PhoneMockup";

const categories = [
  {
    name: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Biryani",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=150&q=80",
  },
];

const restaurants = [
  {
    name: "Spice Kitchen",
    cuisine: "Indian • Chinese",
    rating: "4.8",
    time: "25 min",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Burger Point",
    cuisine: "Burger • Fast Food",
    rating: "4.7",
    time: "20 min",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
  },
];

function FoodDeliveryAppScreen() {
  return (
    <div className="relative h-full overflow-hidden bg-[#f7f7f7] text-gray-900">
      {/* App header */}
      <div className="px-3 pt-4 pb-5 text-white bg-gradient-to-br from-orange-500 via-orange-500 to-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[6px] font-medium text-white/70">
              Delivering to
            </p>

            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 fill-white" />

              <span className="text-[8px] font-extrabold">Home, Nagod</span>

              <ChevronRight className="h-2.5 w-2.5 rotate-90" />
            </div>
          </div>

          <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/20 text-[8px] font-extrabold backdrop-blur">
            RS
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 border border-orange-500 rounded-full" />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[14px] font-extrabold leading-tight">
            What would you like
            <br />
            to eat today?
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2.5 text-gray-400 shadow-lg">
            <Search className="w-3 h-3" />

            <span className="text-[6px]">Search food or restaurant</span>

            <span className="flex items-center justify-center w-5 h-5 ml-auto text-orange-500 rounded-md bg-orange-50">
              ⚙
            </span>
          </div>
        </div>
      </div>

      {/* App body */}
      <div className="p-3 pb-20 space-y-3">
        {/* Offer banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-950 to-gray-800 p-2.5 text-white shadow-md">
          <div className="relative z-10 max-w-[65%]">
            <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[5px] font-bold uppercase">
              Today&apos;s offer
            </span>

            <p className="mt-1.5 text-[9px] font-extrabold leading-tight">
              Get 40% off on your first order
            </p>

            <button className="mt-1.5 flex items-center gap-1 text-[6px] font-bold text-orange-400">
              Order now
              <ArrowRight className="w-2 h-2" />
            </button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=180&q=80"
            alt="Food offer"
            className="absolute -right-2 top-0 h-full w-[42%] rotate-3 object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-orange-500/10" />
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-extrabold">
              What&apos;s on your mind?
            </p>

            <span className="text-[6px] font-bold text-orange-500">
              See all
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {categories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl bg-white p-1.5 text-center shadow-sm"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full rounded-lg h-11"
                />

                <p className="mt-1 text-[6px] font-bold">{category.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurants */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-extrabold">Popular near you</p>

            <span className="text-[6px] font-bold text-orange-500">
              View all
            </span>
          </div>

          <div className="mt-2 space-y-2">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className="flex gap-2 rounded-xl bg-white p-1.5 shadow-sm"
              >
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="object-cover w-16 rounded-lg h-14 shrink-0"
                />

                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <p className="truncate text-[7px] font-extrabold">
                      {restaurant.name}
                    </p>

                    <p className="mt-0.5 truncate text-[5px] text-gray-400">
                      {restaurant.cuisine}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[5px] text-gray-500">
                    <span className="flex items-center gap-0.5 font-bold text-green-600">
                      <Star className="w-2 h-2 fill-green-600" />
                      {restaurant.rating}
                    </span>

                    <span className="h-0.5 w-0.5 rounded-full bg-gray-300" />

                    <span className="flex items-center gap-0.5">
                      <Clock3 className="w-2 h-2" />
                      {restaurant.time}
                    </span>

                    <span className="ml-auto rounded bg-orange-50 px-1 py-0.5 font-bold text-orange-500">
                      Free delivery
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App bottom navigation */}
      <div className="absolute flex items-center justify-around px-2 py-2 border border-gray-100 shadow-xl inset-x-2 bottom-2 rounded-2xl bg-white/95 backdrop-blur">
        <div className="flex flex-col items-center gap-0.5 text-orange-500">
          <span className="text-[10px]">⌂</span>
          <span className="text-[5px] font-bold">Home</span>
        </div>

        <div className="flex flex-col items-center gap-0.5 text-gray-400">
          <Search className="h-2.5 w-2.5" />
          <span className="text-[5px]">Search</span>
        </div>

        <div className="relative -mt-6 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#f7f7f7] bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
          <ShoppingBag className="h-3.5 w-3.5" />

          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gray-950 text-[5px] font-bold">
            2
          </span>
        </div>

        <div className="flex flex-col items-center gap-0.5 text-gray-400">
          <Clock3 className="h-2.5 w-2.5" />
          <span className="text-[5px]">Orders</span>
        </div>

        <div className="flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-[9px]">♙</span>
          <span className="text-[5px]">Profile</span>
        </div>
      </div>
    </div>
  );
}

export default function FinalCTA() {
  return (
    <section
      id="download-app"
      className="relative py-20 overflow-hidden text-white bg-gray-950 sm:py-24 lg:py-28"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-52 -top-52 h-[550px] w-[550px] rounded-full bg-orange-500/25 blur-[120px]" />

        <div className="absolute -bottom-64 right-0 h-[600px] w-[600px] rounded-full bg-red-500/20 blur-[130px]" />

        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
      </div>

      {/* Floating decorative food */}
      <motion.div
        animate={{
          y: [0, -18, 0],
          rotate: [-8, 5, -8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-[4%] top-[15%] hidden text-6xl opacity-10 lg:block"
      >
        🍔
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [8, -5, 8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute bottom-[12%] right-[4%] hidden text-7xl opacity-10 lg:block"
      >
        🍕
      </motion.div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          {/* CTA content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-400 backdrop-blur"
            >
              <Sparkles className="w-4 h-4" />
              Your next meal awaits
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Your favourite food is
              <span className="block text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text">
                only a tap away.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              className="max-w-xl mt-6 text-base leading-7 text-gray-400 sm:text-lg"
            >
              Discover the best local restaurants, explore delicious food and
              get your favourites delivered fresh to your doorstep.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap mt-7 gap-x-5 gap-y-3"
            >
              {["Fast delivery", "Secure payments", "Live tracking"].map(
                (feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15">
                      <Check
                        className="w-3 h-3 text-green-400"
                        strokeWidth={3}
                      />
                    </span>

                    {feature}
                  </div>
                ),
              )}
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4 mt-9 sm:flex-row"
            >
              <Button
                variant="primary"
                className="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3.5 shadow-[0_15px_35px_rgba(249,115,22,0.3)]"
              >
                <span className="flex items-center justify-center rounded-full h-9 w-9 bg-white/15">
                  <Download className="w-5 h-5" />
                </span>

                <span className="text-left">
                  <span className="block text-[9px] font-medium uppercase tracking-wider text-white/70">
                    Get it now
                  </span>

                  <span className="block text-sm font-extrabold">
                    Download App
                  </span>
                </span>

                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>

              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-white backdrop-blur transition-all hover:border-orange-400/40 hover:bg-white/10"
              >
                <QrCode className="w-6 h-6 text-orange-400" />

                <span className="text-left">
                  <span className="block text-[9px] font-medium uppercase tracking-wider text-gray-500">
                    Open camera
                  </span>

                  <span className="block text-sm font-extrabold">
                    Scan QR Code
                  </span>
                </span>
              </button>
            </motion.div>

            {/* QR and rating */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap items-center gap-5 border-t mt-9 border-white/10 pt-7"
            >
              <div className="flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://example.com/download"
                  alt="Scan to download the app"
                  className="object-contain w-full h-full"
                />
              </div>

              <div>
                <p className="text-sm font-extrabold text-white">
                  Scan to download
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Available for Android devices
                </p>
              </div>

              <div className="hidden w-px h-11 bg-white/10 sm:block" />

              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  <strong className="text-white">4.8</strong> from 2,000+
                  customers
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Safe download • Secure payments • No hidden charges
            </div>
          </div>

          {/* App phone preview */}
          <div className="relative flex min-h-[610px] items-center justify-center">
            {/* Phone glow */}
            <div className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/15 blur-[90px]" />

            {/* Orbit circles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-[510px] w-[510px] rounded-full border border-dashed border-white/10"
            >
              <span className="absolute left-1/2 top-[-10px] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl backdrop-blur">
                🍕
              </span>

              <span className="absolute bottom-[12%] right-[3%] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl backdrop-blur">
                🍔
              </span>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{
                opacity: 0,
                y: 60,
                rotate: 0,
                scale: 0.9,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                rotate: 3,
                scale: 1,
              }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              whileHover={{
                rotate: 0,
                scale: 1.02,
              }}
              className="relative z-20"
            >
              <PhoneMockup className="shadow-[0_45px_100px_rgba(0,0,0,0.45)]">
                <FoodDeliveryAppScreen />
              </PhoneMockup>
            </motion.div>

            {/* Floating order notification */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              animate={{ y: [0, -9, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.5 },
                x: { duration: 0.5, delay: 0.5 },
                y: {
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute right-0 top-[20%] z-30 hidden rounded-2xl border border-white/15 bg-white/95 p-3 text-gray-900 shadow-2xl backdrop-blur sm:block lg:-right-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                </span>

                <div>
                  <p className="text-xs font-extrabold">Order confirmed!</p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Restaurant is preparing it
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating delivery notification */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              animate={{ y: [0, 10, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.7 },
                x: { duration: 0.5, delay: 0.7 },
                y: {
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute bottom-[18%] left-0 z-30 hidden rounded-2xl border border-white/15 bg-gray-900/95 p-3 shadow-2xl backdrop-blur sm:block lg:-left-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 text-xl rounded-xl bg-orange-500/15">
                  🛵
                </span>

                <div>
                  <p className="text-xs font-extrabold text-white">
                    Rahul is on the way
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock3 className="w-3 h-3 text-orange-400" />
                    Arriving in 12 minutes
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating discount */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [-5, 2, -5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-[8%] top-[12%] z-10 hidden h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-center text-gray-950 shadow-xl shadow-orange-500/20 lg:flex"
            >
              <span className="text-xs font-black leading-tight">
                40%
                <br />
                OFF
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
