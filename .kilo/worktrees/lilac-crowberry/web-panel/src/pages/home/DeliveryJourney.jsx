import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Bike, Clock3, Home, MapPin, Navigation } from "lucide-react";

import SectionHeading from "../../components/common/SectionHeading";

export default function DeliveryJourney() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Rider movement
  const riderX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ["8%", "22%", "38%", "54%", "70%", "84%"],
  );

  const riderY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ["25%", "32%", "48%", "43%", "60%", "70%"],
  );

  const riderRotate = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [10, 18, 6, -10, 15, 8],
  );

  const restaurantScale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.6],
    [1.08, 1, 0.94],
  );

  const restaurantOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.75]);

  const homeScale = useTransform(
    scrollYProgress,
    [0.4, 0.75, 1],
    [0.92, 1, 1.08],
  );

  const routeProgress = useTransform(scrollYProgress, [0.05, 0.9], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative py-20 overflow-hidden bg-white sm:py-24 lg:py-28"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-52 top-20 h-[400px] w-[400px] rounded-full bg-orange-100/60 blur-3xl" />

        <div className="absolute -right-52 bottom-0 h-[400px] w-[400px] rounded-full bg-green-100/50 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading
          title="From their kitchen to your doorstep."
          subtitle="Watch your order travel from the restaurant to you."
        />

        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative mt-14 h-[420px] overflow-hidden rounded-[32px] border border-orange-100 bg-[#eaf0e9] shadow-[0_25px_70px_rgba(15,23,42,0.12)] sm:h-[500px] lg:mt-16 lg:h-[540px]"
        >
          {/* Map image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-[0.12]" />

          {/* Map color layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-transparent to-green-50/70" />

          {/* Map roads */}
          <div className="absolute -left-[5%] top-[42%] h-5 w-[58%] -rotate-6 rounded-full bg-white/70 shadow-sm" />

          <div className="absolute right-[-5%] top-[35%] h-5 w-[60%] rotate-12 rounded-full bg-white/70 shadow-sm" />

          <div className="absolute left-[42%] top-[-5%] h-[58%] w-5 rotate-12 rounded-full bg-white/70 shadow-sm" />

          <div className="absolute bottom-[8%] left-[23%] h-5 w-[70%] -rotate-3 rounded-full bg-white/70 shadow-sm" />

          {/* Map landscape shapes */}
          <div className="absolute -bottom-12 -left-12 h-48 w-56 rotate-12 rounded-[45%] bg-blue-200/35" />

          <div className="absolute right-[8%] top-[8%] h-28 w-44 -rotate-12 rounded-[45%] bg-green-300/30" />

          {/* Small map buildings */}
          {[
            "left-[10%] top-[58%]",
            "left-[26%] top-[17%]",
            "left-[40%] bottom-[8%]",
            "right-[29%] top-[18%]",
            "right-[8%] bottom-[24%]",
          ].map((position) => (
            <div
              key={position}
              className={`absolute ${position} grid grid-cols-2 gap-1 opacity-35`}
            >
              <span className="h-4 bg-gray-400 rounded-sm w-7" />
              <span className="w-5 h-4 bg-gray-400 rounded-sm" />
              <span className="w-5 h-3 bg-gray-400 rounded-sm" />
              <span className="h-3 bg-gray-400 rounded-sm w-7" />
            </div>
          ))}

          {/* Live badge */}
          <div className="absolute z-30 flex items-center gap-2 px-3 py-2 border rounded-full shadow-lg left-4 top-4 border-white/70 bg-white/90 backdrop-blur sm:left-6 sm:top-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-700 sm:text-xs">
              Live delivery
            </span>
          </div>

          {/* ETA badge */}
          <div className="absolute z-30 flex items-center gap-2 px-3 py-2 text-white rounded-full shadow-lg right-4 top-4 bg-gray-950 sm:right-6 sm:top-6">
            <Clock3 className="w-4 h-4 text-orange-400" />

            <span className="text-[10px] font-bold sm:text-xs">
              ETA: 12 min
            </span>
          </div>

          {/* Route line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 540"
            preserveAspectRatio="none"
          >
            {/* White route background */}
            <path
              d="M 105 145 C 220 145, 245 285, 370 280 C 490 275, 520 195, 635 230 C 760 270, 750 385, 875 405"
              stroke="white"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            {/* Full dashed route */}
            <path
              d="M 105 145 C 220 145, 245 285, 370 280 C 490 275, 520 195, 635 230 C 760 270, 750 385, 875 405"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="11 12"
              fill="none"
              opacity="0.4"
            />

            {/* Animated route */}
            <motion.path
              d="M 105 145 C 220 145, 245 285, 370 280 C 490 275, 520 195, 635 230 C 760 270, 750 385, 875 405"
              stroke="#f97316"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: routeProgress }}
            />
          </svg>

          {/* Restaurant */}
          <motion.div
            style={{
              scale: restaurantScale,
              opacity: restaurantOpacity,
            }}
            className="absolute left-[6%] top-[18%] z-20 flex flex-col items-center"
          >
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-orange-500/25" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_12px_30px_rgba(249,115,22,0.35)] sm:h-16 sm:w-16">
                <MapPin className="w-6 h-6 sm:h-7 sm:w-7" />
              </div>
            </div>

            <div className="px-3 py-2 mt-2 text-center border shadow-lg rounded-xl border-white/80 bg-white/90 backdrop-blur">
              <p className="text-[10px] font-extrabold text-gray-900 sm:text-xs">
                Restaurant
              </p>

              <p className="mt-0.5 hidden text-[9px] text-gray-400 sm:block">
                Order picked up
              </p>
            </div>
          </motion.div>

          {/* Customer home */}
          <motion.div
            style={{ scale: homeScale }}
            className="absolute bottom-[13%] right-[6%] z-20 flex flex-col items-center"
          >
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-green-500/25" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_12px_30px_rgba(34,197,94,0.3)] sm:h-16 sm:w-16">
                <Home className="w-6 h-6 sm:h-7 sm:w-7" />
              </div>
            </div>

            <div className="px-3 py-2 mt-2 text-center border shadow-lg rounded-xl border-white/80 bg-white/90 backdrop-blur">
              <p className="text-[10px] font-extrabold text-gray-900 sm:text-xs">
                Your Home
              </p>

              <p className="mt-0.5 hidden text-[9px] text-gray-400 sm:block">
                Delivery destination
              </p>
            </div>
          </motion.div>

          {/* Moving rider */}
          <motion.div
            style={{
              left: riderX,
              top: riderY,
              rotate: riderRotate,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="absolute z-40"
          >
            <div className="relative">
              <span className="absolute rounded-full -inset-2 animate-ping bg-orange-500/20" />

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gray-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)]"
              >
                <Bike className="w-6 h-6 text-orange-400" />

                <span className="absolute flex items-center justify-center w-5 h-5 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1">
                  <Navigation className="h-2.5 w-2.5 fill-white text-white" />
                </span>
              </motion.div>
            </div>

            <div className="absolute left-1/2 top-[62px] -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-950 px-3 py-1.5 text-[9px] font-bold text-white shadow-lg">
              Rahul is here
            </div>
          </motion.div>

          {/* Bottom distance */}
          <div className="absolute bottom-4 left-4 z-30 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-[10px] font-bold text-gray-600 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:text-xs">
            2.4 km remaining
          </div>
        </motion.div>
      </div>
    </section>
  );
}
