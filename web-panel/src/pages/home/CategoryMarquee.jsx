import { motion } from "framer-motion";

const categories = [
  "🍕 Pizza",
  "🍔 Burger",
  "🍛 Biryani",
  "🥘 Indian",
  "🎂 Cakes",
  "🍜 Chinese",
  "🥗 Healthy",
  "☕ Café",
  "🍨 Desserts",
];

export default function CategoryMarquee() {
  return (
    <div className="py-6 overflow-hidden bg-white/50 border-y border-gray-100/50">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...categories, ...categories].map((cat, i) => (
          <span key={i} className="mx-8 text-lg font-medium text-gray-700">
            {cat}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
