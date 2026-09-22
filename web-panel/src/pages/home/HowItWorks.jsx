import { motion } from "framer-motion";
import SectionHeading from "../../components/common/SectionHeading";
import { MapPin, Utensils, ShoppingBag, Truck } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    label: "Choose your location",
    desc: "Enter your address to find nearby eateries.",
  },
  {
    icon: Utensils,
    label: "Pick your favourite place",
    desc: "Browse menus and select your dishes.",
  },
  {
    icon: ShoppingBag,
    label: "Place your order",
    desc: "Confirm and pay easily with one tap.",
  },
  {
    icon: Truck,
    label: "Track & enjoy",
    desc: "Follow your rider live until it arrives.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-brand-light">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading
          title="Good food is just a few taps away."
          subtitle="Simple, fast, and reliable – from order to delivery."
        />
        <div className="relative grid gap-8 mt-16 md:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center w-20 h-20 text-3xl rounded-full bg-brand-primary/10 text-brand-primary">
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-brand-dark">
                {step.label}
              </h3>
              <p className="mt-2 text-gray-600">{step.desc}</p>
              {idx < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-brand-primary/20"
                  style={{ transform: "translateX(-50%)" }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
