import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Clock3,
  MapPin,
  CheckCircle2,
  Search,
  Navigation,
  Bike,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import Button from "../../components/common/Button";
import PhoneMockup from "../../components/common/PhoneMockup";
import FloatingFood from "../../components/ui/FloatingFood";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const categories = [
  {
    name: "Pizza",
    emoji: "🍕",
    bg: "bg-orange-50",
  },
  {
    name: "Burger",
    emoji: "🍔",
    bg: "bg-yellow-50",
  },
  {
    name: "Biryani",
    emoji: "🍛",
    bg: "bg-amber-50",
  },
];

const restaurantCards = [
  {
    name: "Sharma Dhaba",
    cuisine: "North Indian",
    rating: "4.6",
    time: "25-30 min",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=220&fit=crop",
  },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-light via-white to-orange-50/70"
    >
      {/* =========================================================
          BACKGROUND DECORATIONS
      ========================================================== */}

      <div className="absolute inset-0 pointer-events-none">
        {/* Main glow */}
        <div
          className="
            absolute
            -left-32 top-12
            h-[420px] w-[420px]
            rounded-full
            bg-brand-primary/10
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            -right-32 top-1/3
            h-[500px] w-[500px]
            rounded-full
            bg-brand-secondary/15
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            bottom-[-200px] left-1/2
            h-[500px] w-[700px]
            -translate-x-1/2
            rounded-full
            bg-orange-100/50
            blur-[130px]
          "
        />

        {/* Grid */}
        <div
          className="
            absolute inset-0
            opacity-[0.035]
            [background-image:linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)]
            [background-size:42px_42px]
          "
        />

        {/* Decorative dots */}
        <div className="absolute left-[8%] top-[22%] h-2 w-2 rounded-full bg-brand-primary/40" />
        <div className="absolute left-[14%] top-[32%] h-1.5 w-1.5 rounded-full bg-brand-secondary/50" />
        <div className="absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-brand-primary/30" />
        <div className="absolute right-[16%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-brand-secondary/50" />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <div className="relative z-10 flex items-center min-h-screen px-4 pb-16 mx-auto max-w-7xl pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32">
        <div
          className="
            grid w-full
            items-center
            gap-14
            lg:grid-cols-[1.05fr_0.95fr]
            xl:gap-20
          "
        >
          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {/* Launch Badge */}
            <motion.div variants={fadeUp}>
              <div
                className="
                  mb-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border border-brand-primary/15
                  bg-white/80
                  px-3.5
                  py-2
                  text-sm
                  font-semibold
                  text-brand-dark
                  shadow-sm
                  shadow-orange-100
                  backdrop-blur-xl
                "
              >
                <span className="flex items-center justify-center rounded-full h-7 w-7 bg-brand-primary/10 text-brand-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>

                <span>Now delivering in your city</span>

                <span className="relative flex w-2 h-2 ml-1">
                  <span className="absolute inline-flex w-full h-full bg-green-500 rounded-full opacity-50 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full" />
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              className="
                max-w-3xl
                text-4xl
                font-extrabold
                leading-[1.08]
                tracking-[-0.035em]
                text-brand-dark
                sm:text-5xl
                md:text-6xl
                lg:text-[64px]
                xl:text-[72px]
              "
            >
              Your city's
              <span className="relative inline-block mx-2 text-brand-primary">
                favourite food
                <svg
                  viewBox="0 0 300 20"
                  className="absolute left-0 w-full h-3 -bottom-2 text-brand-secondary"
                  fill="none"
                >
                  <path
                    d="M3 13C70 3 200 3 297 10"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
              delivered to your door.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="max-w-xl text-base leading-7 text-gray-600 mt-7 sm:text-lg sm:leading-8"
            >
              Discover your favourite local restaurants, dhabas, bakeries, cafés
              and more — then get your order delivered quickly, safely and
              simply.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-3 mt-8 sm:flex-row sm:items-center"
            >
              <Button
                variant="primary"
                className="text-base font-semibold shadow-xl group min-h-14 rounded-2xl px-7 shadow-brand-primary/50"
              >
                Download App
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <button
                type="button"
                className="
                  group
                  inline-flex
                  min-h-14
                  items-center
                  justify-center
                  rounded-2xl
                  border border-gray-200
                  bg-white
                  px-7
                  text-base
                  font-semibold
                  text-brand-dark
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-brand-primary/30
                  hover:shadow-lg
                "
              >
                Explore Restaurants
                <ChevronRight className="w-5 h-5 ml-1 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-brand-primary" />
              </button>
            </motion.div>

            {/* Trust / Social Proof */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-5 pt-6 border-t mt-9 border-gray-200/70 sm:flex-row sm:items-center"
            >
              {/* Avatars */}
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((item) => (
                    <img
                      key={item}
                      src={`https://ui-avatars.com/api/?name=User+${item}&background=e85d3a&color=ffffff&bold=true`}
                      alt={`Customer ${item}`}
                      className="
                        h-10
                        w-10
                        rounded-full
                        border-[3px]
                        border-white
                        object-cover
                        shadow-sm
                      "
                    />
                  ))}
                </div>

                <div
                  className="
                    -ml-2
                    flex
                    h-10
                    min-w-10
                    items-center
                    justify-center
                    rounded-full
                    border-[3px]
                    border-white
                    bg-brand-dark
                    px-2
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  5K+
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}

                  <span className="ml-1 text-sm font-bold text-brand-dark">
                    4.8
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Loved by local food customers
                </p>
              </div>
            </motion.div>

            {/* Mini Features */}
            <motion.div
              variants={fadeUp}
              className="grid max-w-xl grid-cols-1 gap-3 mt-7 sm:grid-cols-3"
            >
              <MiniFeature
                icon={<Clock3 className="w-4 h-4" />}
                title="Fast delivery"
              />

              <MiniFeature
                icon={<Navigation className="w-4 h-4" />}
                title="Live tracking"
              />

              <MiniFeature
                icon={<ShieldCheck className="w-4 h-4" />}
                title="Secure orders"
              />
            </motion.div>
          </motion.div>

          {/* =====================================================
              RIGHT VISUAL
          ====================================================== */}

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="
              relative
              mx-auto
              flex
              w-full
              max-w-[560px]
              justify-center
              lg:max-w-none
            "
          >
            {/* Large behind phone glow */}
            <div
              className="
                absolute
                left-1/2 top-1/2
                h-[500px] w-[500px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-gradient-to-br
                from-brand-primary/15
                via-brand-secondary/10
                to-transparent
                blur-2xl
              "
            />

            {/* Rotating background ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                absolute
                left-1/2 top-1/2
                h-[430px] w-[430px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border border-dashed
                border-brand-primary/15
              "
            />

            {/* Phone */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                relative
                z-20
                drop-shadow-[0_45px_55px_rgba(26,26,46,0.18)]
              "
            >
              <PhoneMockup>
                <PhoneAppPreview />
              </PhoneMockup>
            </motion.div>

            {/* Floating food items */}
            <FloatingFood
              icon="🍕"
              label="Pizza"
              className="
                absolute
                right-0
                top-[5%]
                z-30
                animate-float
                sm:right-[-5%]
                xl:right-[-9%]
              "
            />

            <FloatingFood
              icon="🍔"
              label="Burger"
              className="
                absolute
                bottom-[2%]
                left-0
                z-30
                animate-float-slow
                sm:left-[-3%]
                xl:left-[-10%]
              "
            />

            <FloatingFood
              icon="🍛"
              label="Biryani"
              className="
                absolute
                right-[-3%]
                top-[38%]
                z-30
                hidden
                animate-float-slow
                md:block
                xl:right-[-15%]
              "
            />

            <FloatingFood
              icon="🎂"
              label="Cake"
              className="
                absolute
                bottom-[27%]
                left-[-5%]
                z-30
                hidden
                animate-float
                md:block
                xl:left-[-16%]
              "
            />

            {/* Order confirmed card */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -right-3
                bottom-[20%]
                z-40
                hidden
                w-[205px]
                rounded-2xl
                border border-white/80
                bg-white/90
                p-3.5
                shadow-2xl
                shadow-gray-900/10
                backdrop-blur-xl
                lg:block
                xl:-right-16
              "
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-brand-dark">
                    Order confirmed
                  </p>

                  <p className="text-xs text-gray-500">
                    Restaurant is preparing
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Delivery card */}
            <motion.div
              animate={{
                y: [0, 6, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -left-3
                top-[18%]
                z-40
                hidden
                w-[190px]
                rounded-2xl
                border border-white/80
                bg-white/90
                p-3.5
                shadow-2xl
                shadow-gray-900/10
                backdrop-blur-xl
                lg:block
                xl:-left-20
              "
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary/10">
                  <Bike className="w-5 h-5 text-brand-primary" />

                  <span className="absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full -right-1 -top-1" />
                </div>

                <div>
                  <p className="text-sm font-bold text-brand-dark">
                    Rider nearby
                  </p>

                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock3 className="w-3 h-3" />
                    12 min away
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Rating */}
            <div
              className="
                absolute
                right-[2%]
                top-[65%]
                z-30
                hidden
                rounded-full
                border border-white/80
                bg-white/90
                px-4
                py-2
                shadow-lg
                backdrop-blur-lg
                sm:flex
                items-center
                gap-2
                xl:right-[-9%]
              "
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />

              <span className="text-sm font-bold text-brand-dark">
                4.8 Rating
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

/* =========================================================
   PHONE APP PREVIEW
========================================================== */

function PhoneAppPreview() {
  return (
    <div className="space-y-3 bg-gray-50/80 p-2.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-medium text-gray-400">Delivering to</p>

          <div className="mt-0.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-brand-primary" />

            <span className="text-xs font-bold text-brand-dark">
              Main Market
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm ">
          🔔
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="
            absolute
            left-3
            top-1/2
            h-3.5 w-3.5
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          readOnly
          type="text"
          placeholder="Search food or restaurant..."
          className="
            w-full
            rounded-xl
            border border-gray-100
            bg-white
            py-2.5
            pl-9
            pr-3
            text-[10px]
            outline-none
          "
        />
      </div>

      {/* Offer Banner */}
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          bg-gradient-to-br
          from-brand-primary
          to-orange-400
          px-3
          py-3.5
          text-white
        "
      >
        <div className="relative z-10">
          <p className="text-[9px] font-medium text-white/80">FIRST ORDER</p>

          <p className="mt-0.5 text-lg font-extrabold">50% OFF</p>

          <p className="mt-0.5 text-[8px] text-white/85">
            On selected restaurants
          </p>
        </div>

        <div className="absolute w-20 h-20 rounded-full -right-7 -top-5 bg-white/10" />

        <div className="absolute text-4xl bottom-1 right-3">🍔</div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-brand-dark">
            What's on your mind?
          </p>

          <span className="text-[8px] font-semibold text-brand-primary">
            See all
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className={`
                ${category.bg}
                rounded-xl
                p-2
                text-center
              `}
            >
              <div className="text-xl">{category.emoji}</div>

              <p className="mt-1 text-[8px] font-semibold text-brand-dark">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurant */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-brand-dark">
            Popular near you
          </p>

          <span className="text-[8px] text-brand-primary">View all</span>
        </div>

        {restaurantCards.map((restaurant) => (
          <div
            key={restaurant.name}
            className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl"
          >
            <div className="relative h-24 overflow-hidden">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="object-cover w-full h-full"
              />

              <div
                className="
                  absolute
                  bottom-2
                  left-2
                  rounded-md
                  bg-brand-dark/80
                  px-2
                  py-1
                  text-[8px]
                  font-medium
                  text-white
                  backdrop-blur-sm
                "
              >
                FREE DELIVERY
              </div>
            </div>

            <div className="p-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-brand-dark">
                    {restaurant.name}
                  </p>

                  <p className="mt-0.5 text-[8px] text-gray-400">
                    {restaurant.cuisine}
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-0.5
                    rounded-md
                    bg-green-600
                    px-1.5
                    py-1
                    text-[8px]
                    font-bold
                    text-white
                  "
                >
                  {restaurant.rating}
                  <Star className="w-2 h-2 fill-white" />
                </div>
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-1
                  text-[8px]
                  font-medium
                  text-gray-500
                "
              >
                <Clock3 className="h-2.5 w-2.5" />

                {restaurant.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="grid grid-cols-4 px-2 py-2 mt-2 bg-white border border-gray-100 shadow-sm rounded-2xl">
        {[
          ["🏠", "Home"],
          ["🔍", "Search"],
          ["🧾", "Orders"],
          ["👤", "Account"],
        ].map(([icon, label], index) => (
          <div
            key={label}
            className={`
              text-center
              ${index === 0 ? "text-brand-primary" : "text-gray-400"}
            `}
          >
            <div className="text-xs">{icon}</div>

            <p className="mt-0.5 text-[7px] font-semibold">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SMALL FEATURE
========================================================== */

function MiniFeature({ icon, title }) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border border-gray-200/70
        bg-white/60
        px-3
        py-2.5
        text-sm
        font-medium
        text-gray-600
        backdrop-blur-md
      "
    >
      <div className="flex items-center justify-center rounded-lg h-7 w-7 bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>

      {title}
    </div>
  );
}
