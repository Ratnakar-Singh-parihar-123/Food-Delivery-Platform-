import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";

import { categories } from "../../data/categories";
import SectionHeading from "../../components/common/SectionHeading";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function FoodDiscovery() {
  const handleCategoryClick = (category) => {
    console.log("Selected category:", category.name);

    // Baad mein React Router ke saath:
    // navigate(`/restaurants?category=${category.slug}`);
  };

  const scrollCategories = (direction) => {
    const container = document.getElementById("category-container");

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="explore"
      className="relative py-20 overflow-hidden bg-white sm:py-24 lg:py-28"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full -left-48 top-10 h-96 w-96 bg-orange-100/60 blur-3xl" />

        <div className="absolute bottom-0 rounded-full -right-40 h-96 w-96 bg-red-100/50 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.07)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600"
            >
              <Sparkles className="w-4 h-4" />
              Explore delicious food
            </motion.div>

            <SectionHeading
              align="left"
              title="What's on your mind?"
              subtitle="Explore popular categories and discover delicious food from your favourite local restaurants."
            />
          </div>

          {/* Navigation buttons */}
          <div className="items-center hidden gap-3 sm:flex">
            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => scrollCategories("left")}
              className="flex items-center justify-center text-gray-600 transition-all bg-white border border-gray-200 rounded-full shadow-sm h-11 w-11 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              aria-label="Next categories"
              onClick={() => scrollCategories("right")}
              className="flex items-center justify-center text-white transition-transform rounded-full shadow-lg h-11 w-11 bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/20 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <motion.div
          id="category-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="flex gap-4 pb-6 mt-12 overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:gap-5 lg:grid lg:grid-cols-6 lg:overflow-visible"
        >
          {categories.map((category, index) => (
            <motion.button
              type="button"
              key={category.id || category.name || index}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryClick(category)}
              className="group min-w-[145px] snap-start text-left sm:min-w-[165px] lg:min-w-0"
            >
              <div className="relative overflow-hidden rounded-[26px] border border-orange-100 bg-white p-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:border-orange-200 group-hover:shadow-[0_20px_45px_rgba(249,115,22,0.16)]">
                {/* Category image */}
                <div className="relative aspect-[4/4.3] overflow-hidden rounded-[20px] bg-orange-50">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

                  {/* Number */}
                  <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/20 text-[10px] font-extrabold text-white backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Arrow */}
                  <div className="absolute flex items-center justify-center w-8 h-8 text-orange-500 transition-all duration-300 translate-x-2 bg-white rounded-full shadow-lg opacity-0 right-3 top-3 group-hover:translate-x-0 group-hover:opacity-100">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Text */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                    <h3 className="text-base font-extrabold tracking-tight">
                      {category.name}
                    </h3>

                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-[11px] text-white/75">
                        {category.itemCount ||
                          category.restaurantCount ||
                          `${12 + index * 3}+ options`}
                      </p>

                      <span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-semibold backdrop-blur">
                        Explore
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom call to action */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-10 overflow-hidden rounded-[28px] bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 px-6 py-7 shadow-2xl sm:px-8 lg:flex lg:items-center lg:justify-between"
        >
          {/* CTA decoration */}
          <div className="absolute rounded-full pointer-events-none -right-12 -top-20 h-52 w-52 bg-orange-500/20 blur-3xl" />

          <div className="absolute bottom-0 h-32 -translate-x-1/2 rounded-full pointer-events-none left-1/2 w-72 bg-red-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-orange-400">
              <Search className="w-4 h-4" />

              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Can't find your craving?
              </span>
            </div>

            <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
              Search from hundreds of dishes near you.
            </h3>

            <p className="max-w-xl mt-2 text-sm leading-6 text-gray-400">
              Enter a dish, restaurant or cuisine and we'll find the best
              available options in your area.
            </p>
          </div>

          <button
            type="button"
            className="group relative mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.03] lg:mt-0"
          >
            <Search className="w-4 h-4" />
            Search food
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
