import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-[#e85d3a] text-white hover:bg-[#d94f2f] focus:ring-[#e85d3a]",

    secondary:
      "bg-white text-[#e85d3a] border-2 border-[#e85d3a] hover:bg-[#e85d3a] hover:text-white focus:ring-[#e85d3a]",

    outline:
      "bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#1a1a2e] focus:ring-white",

    dark: "bg-[#1a1a2e] text-white hover:bg-[#111827] focus:ring-[#1a1a2e]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
