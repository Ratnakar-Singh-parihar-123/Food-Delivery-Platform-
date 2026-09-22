import { motion } from "framer-motion";
import SectionHeading from "../../components/common/SectionHeading";
import { Zap, Store, Shield, Gift, Map, Heart } from "lucide-react";

const features = [
  { icon: Zap, label: "Fast Delivery", desc: "Hot food, delivered quickly." },
  {
    icon: Store,
    label: "Local Restaurants",
    desc: "Support your neighbourhood.",
  },
  { icon: Shield, label: "Secure Payments", desc: "Pay safely online." },
  { icon: Gift, label: "Great Offers", desc: "Daily deals and discounts." },
  { icon: Map, label: "Live Tracking", desc: "Know where your order is." },
  { icon: Heart, label: "Local Support", desc: "We care about your city." },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading title="Local favourites. Better delivery." />
        <div className="grid gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
              }}
              className="p-6 text-center transition-all border border-gray-100 bg-gray-50 rounded-2xl"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-brand-primary/10 text-brand-primary">
                <feat.icon className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-brand-dark">
                {feat.label}
              </h3>
              <p className="mt-2 text-gray-600">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
