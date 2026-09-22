import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Check,
  ChevronRight,
  Clock3,
  Headphones,
  IndianRupee,
  MapPin,
  Navigation,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";

import SectionHeading from "../../components/common/SectionHeading";
import Button from "../../components/common/Button";

const riderBenefits = [
  {
    icon: Clock3,
    title: "Flexible working hours",
    description: "Choose when you want to go online and start delivering.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: IndianRupee,
    title: "Transparent earnings",
    description: "Track every delivery payment, incentive and tip clearly.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Navigation,
    title: "Nearby deliveries",
    description: "Receive orders available around your current location.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Smartphone,
    title: "Simple rider app",
    description: "Manage orders, navigation and earnings from one app.",
    color: "bg-purple-50 text-purple-600",
  },
];

const joiningSteps = [
  "Submit your basic details",
  "Complete document verification",
  "Download the rider app",
  "Go online and start earning",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Riders() {
  return (
    <section
      id="riders"
      className="relative py-20 overflow-hidden bg-white sm:py-24 lg:py-28"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-52 top-20 h-[420px] w-[420px] rounded-full bg-orange-100/70 blur-3xl" />

        <div className="absolute -right-52 bottom-0 h-[450px] w-[450px] rounded-full bg-green-100/50 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Rider image section */}
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            {/* Decorative shape */}
            <div className="absolute -left-6 top-12 h-[88%] w-[90%] rotate-[-4deg] rounded-[42px] bg-gradient-to-br from-orange-500 to-red-500 opacity-15" />

            <div className="absolute -right-5 bottom-12 h-[70%] w-[70%] rotate-[5deg] rounded-[40px] border border-dashed border-orange-300" />

            {/* Main image */}
            <div className="relative z-10 overflow-hidden rounded-[36px] border-[6px] border-white bg-gray-100 shadow-[0_35px_90px_rgba(15,23,42,0.2)]">
              <img
                src="https://i.pinimg.com/736x/3b/10/e8/3b10e8f70bfcee5577154d9c23f984ee.jpg"
                alt="Delivery partner riding a scooter"
                className="h-[560px] w-full object-cover object-center sm:h-[650px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-transparent to-gray-950/10" />

              {/* Image bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur">
                  <BadgeCheck className="h-3.5 w-3.5 text-green-400" />
                  Verified delivery partner
                </span>

                <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                  Earn on your own schedule.
                </h3>

                <p className="max-w-sm mt-2 text-sm leading-6 text-white/70">
                  Go online whenever you want and receive delivery requests
                  available near you.
                </p>
              </div>
            </div>

            {/* Earnings card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-2 top-[14%] z-30 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur sm:-right-10"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-green-50">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </span>

                <div>
                  <p className="text-[10px] font-medium text-gray-400">
                    Today&apos;s earnings
                  </p>

                  <p className="mt-0.5 text-lg font-extrabold text-gray-900">
                    ₹520
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1.5 text-[10px] font-bold text-green-600">
                <TrendingUp className="w-3 h-3" />
                +12% from yesterday
              </div>
            </motion.div>

            {/* Rating badge */}
            <motion.div
              animate={{
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-4 top-[9%] z-20 hidden h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-center text-gray-950 shadow-xl shadow-orange-500/20 sm:flex"
            >
              <div>
                <p className="text-lg font-black">4.9★</p>
                <p className="text-[8px] font-bold uppercase tracking-wider">
                  Rider rating
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Content section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600"
            >
              <Sparkles className="w-4 h-4" />
              Become a delivery partner
            </motion.div>

            <div className="mt-5">
              <SectionHeading
                align="left"
                title="Ride. Deliver. Earn."
                subtitle="Join our delivery fleet, work on your own schedule and earn by delivering food in your local area."
              />
            </div>

            {/* Benefits */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-3 mt-8 sm:grid-cols-2"
            >
              {riderBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <motion.div
                    key={benefit.title}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="group rounded-[22px] border border-gray-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-orange-100 hover:shadow-[0_18px_40px_rgba(249,115,22,0.1)]"
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${benefit.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>

                    <h3 className="mt-3 text-sm font-extrabold text-gray-900 group-hover:text-orange-600">
                      {benefit.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-5 text-gray-500">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Joining steps */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 rounded-[24px] border border-orange-100 bg-orange-50/60 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-gray-900">
                    Start delivering in four simple steps
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    A quick and transparent onboarding process
                  </p>
                </div>

                <span className="items-center justify-center hidden w-10 h-10 text-orange-500 bg-white shadow-sm rounded-xl sm:flex">
                  <Zap className="w-5 h-5" />
                </span>
              </div>

              <div className="grid gap-3 mt-5 sm:grid-cols-2">
                {joiningSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-[10px] font-extrabold text-white shadow-sm">
                      {index + 1}
                    </span>

                    <span className="text-xs font-semibold text-gray-700">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-4 mt-8 sm:flex-row sm:items-center"
            >
              <Button
                variant="primary"
                className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3.5 text-base shadow-lg shadow-orange-500/25"
              >
                <Bike className="w-5 h-5" />
                Join as Delivery Partner
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 transition-colors rounded-full group hover:bg-orange-50 hover:text-orange-600"
              >
                Learn how it works
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Trust information */}
            <div className="flex flex-wrap pt-6 border-t border-gray-100 mt-7 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Accident protection
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <WalletCards className="w-4 h-4 text-orange-500" />
                Regular payouts
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Headphones className="w-4 h-4 text-blue-500" />
                Rider support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
