import { motion } from "framer-motion";
import Button from "../common/Button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Explore", href: "#explore" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Partners", href: "#partners" },
  { label: "Riders", href: "#riders" },
  { label: "About", href: "#about" },
];

export default function MobileMenu({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-40 flex flex-col px-6 pt-20 bg-white/95 backdrop-blur-md"
    >
      <nav className="flex flex-col gap-6 text-2xl font-semibold text-gray-800">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="transition-colors hover:text-brand-primary"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-4 mt-8">
        <Button variant="primary" className="justify-center w-full">
          Download App
        </Button>
        <Button variant="secondary" className="justify-center w-full">
          Sign In
        </Button>
      </div>
    </motion.div>
  );
}
