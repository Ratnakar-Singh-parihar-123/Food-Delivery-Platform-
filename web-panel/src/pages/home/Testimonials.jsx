import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../../components/common/SectionHeading";
import { testimonials } from "../../data/testimonials";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-brand-light">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading
          title="What our community says"
          subtitle="Real stories from real people."
        />
        <div className="relative max-w-3xl mx-auto mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center bg-white border border-gray-100 shadow-lg rounded-2xl"
            >
              <div className="flex justify-center mb-4">
                <img
                  src={testimonials[current].avatar}
                  alt={testimonials[current].name}
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <div className="flex justify-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-lg italic text-gray-700">
                "{testimonials[current].text}"
              </p>
              <p className="mt-4 font-bold text-brand-dark">
                {testimonials[current].name}
              </p>
              <p className="text-sm text-gray-500">
                {testimonials[current].role}
              </p>
            </motion.div>
          </AnimatePresence>
          <button
            onClick={prev}
            className="absolute left-0 p-2 -translate-x-12 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 p-2 translate-x-12 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
