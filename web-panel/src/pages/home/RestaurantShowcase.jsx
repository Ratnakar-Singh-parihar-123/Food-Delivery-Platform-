import { motion } from "framer-motion";
import {
  ArrowRight,
  Bike,
  ChevronRight,
  Clock3,
  Gift,
  Heart,
  MapPin,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";

import SectionHeading from "../../components/common/SectionHeading";
import Button from "../../components/common/Button";
import { restaurants } from "../../data/restaurants";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

export default function RestaurantShowcase() {
  const handleRestaurantClick = (restaurant) => {
    console.log("Selected restaurant:", restaurant);

    // React Router use karne ke baad:
    // navigate(`/restaurant/${restaurant.id}`);
  };

  const handleFavourite = (event, restaurant) => {
    event.stopPropagation();

    console.log("Favourite restaurant:", restaurant.name);
  };

  return (
    <section
      id="restaurants"
      className="relative overflow-hidden bg-[#fffaf6] py-20 sm:py-24 lg:py-28"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-52 top-24 h-[420px] w-[420px] rounded-full bg-orange-200/35 blur-3xl" />

        <div className="absolute -right-52 bottom-0 h-[450px] w-[450px] rounded-full bg-red-200/30 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600"
            >
              <Sparkles className="w-4 h-4" />
              Popular near you
            </motion.div>

            <SectionHeading
              align="left"
              title="Discover the best food around you."
              subtitle="From your favourite local dhaba to the bakery around the corner, explore trusted places delivering near you."
            />
          </div>

          <Button
            variant="secondary"
            className="items-center hidden gap-2 px-6 py-3 rounded-full group lg:inline-flex"
          >
            Explore all restaurants
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Restaurant cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid gap-6 mt-12 sm:grid-cols-2 xl:grid-cols-4"
        >
          {restaurants.map((restaurant, index) => (
            <motion.article
              key={restaurant.id || restaurant.name || index}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              onClick={() => handleRestaurantClick(restaurant)}
              className="group relative cursor-pointer overflow-hidden rounded-[26px] border border-orange-100/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_25px_60px_rgba(249,115,22,0.16)]"
            >
              {/* Restaurant image */}
              <div className="relative overflow-hidden h-52 bg-orange-50">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  loading="lazy"
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                {/* Card number */}
                <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                  #{String(index + 1).padStart(2, "0")}
                </span>

                {/* Favourite */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  aria-label={`Add ${restaurant.name} to favourites`}
                  onClick={(event) => handleFavourite(event, restaurant)}
                  className="absolute flex items-center justify-center w-10 h-10 text-gray-500 transition-colors border rounded-full shadow-lg right-4 top-4 border-white/30 bg-white/90 backdrop-blur hover:bg-red-50 hover:text-red-500"
                >
                  <Heart className="h-[18px] w-[18px]" />
                </motion.button>

                {/* Offer */}
                {restaurant.offer && (
                  <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-[10px] font-extrabold text-white shadow-lg shadow-orange-900/20">
                    <Gift className="w-3 h-3" />
                    {restaurant.offer}
                  </div>
                )}

                {/* Image information */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-white/75">
                        <UtensilsCrossed className="w-3 h-3" />
                        {restaurant.type || "Restaurant"}
                      </p>

                      <h3 className="text-lg font-extrabold tracking-tight truncate">
                        {restaurant.name}
                      </h3>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-green-500 px-2 py-1.5 text-xs font-extrabold text-white shadow-lg">
                      {restaurant.rating}
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card content */}
              <div className="relative p-4">
                {/* Logo */}
                {restaurant.logo && (
                  <div className="absolute flex items-center justify-center overflow-hidden bg-white border-4 border-white shadow-lg -top-7 right-4 h-14 w-14 rounded-2xl">
                    <img
                      src={restaurant.logo}
                      alt={`${restaurant.name} logo`}
                      loading="lazy"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className={restaurant.logo ? "pr-14" : ""}>
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {restaurant.cuisine || "North Indian • Fast Food"}
                  </p>
                </div>

                {/* Delivery details */}
                <div className="grid grid-cols-3 px-2 py-3 mt-4 border border-gray-100 divide-x divide-gray-100 rounded-2xl bg-gray-50/80">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Clock3 className="w-4 h-4 text-orange-500" />

                    <span className="whitespace-nowrap text-[10px] font-bold text-gray-700">
                      {restaurant.deliveryTime}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 text-center">
                    <MapPin className="w-4 h-4 text-orange-500" />

                    <span className="whitespace-nowrap text-[10px] font-bold text-gray-700">
                      {restaurant.distance}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 text-center">
                    <Bike className="w-4 h-4 text-orange-500" />

                    <span className="whitespace-nowrap text-[10px] font-bold text-gray-700">
                      {restaurant.deliveryFee || "Free"}
                    </span>
                  </div>
                </div>

                {/* Status and button */}
                <div className="flex items-center justify-between gap-3 mt-4">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${
                      restaurant.isOpen
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        restaurant.isOpen
                          ? "animate-pulse bg-green-500"
                          : "bg-red-500"
                      }`}
                    />

                    {restaurant.isOpen ? "Open now" : "Currently closed"}
                  </div>

                  <button
                    type="button"
                    disabled={!restaurant.isOpen}
                    onClick={(event) => {
                      event.stopPropagation();

                      if (restaurant.isOpen) {
                        handleRestaurantClick(restaurant);
                      }
                    }}
                    className={`group/button flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      restaurant.isOpen
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg"
                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                    }`}
                  >
                    {restaurant.isOpen ? "Order now" : "View menu"}

                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/button:translate-x-0.5" />
                  </button>
                </div>

                {/* Free delivery message */}
                {restaurant.isOpen && (
                  <div className="mt-4 flex items-center gap-2 border-t border-dashed border-gray-200 pt-3 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-50">
                      <Gift className="w-3 h-3 text-orange-500" />
                    </span>
                    Free delivery on orders above{" "}
                    <strong className="text-gray-800">₹299</strong>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Mobile CTA */}
        <div className="flex justify-center mt-10 lg:hidden">
          <Button
            variant="secondary"
            className="flex items-center gap-2 py-3 rounded-full group px-7"
          >
            Explore all restaurants
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
