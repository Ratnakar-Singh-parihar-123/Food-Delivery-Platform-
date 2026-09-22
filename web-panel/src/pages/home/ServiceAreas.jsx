import { motion } from "framer-motion";
import SectionHeading from "../../components/common/SectionHeading";
import Button from "../../components/common/Button";
import { MapPin } from "lucide-react";

const areas = [
  "Main Market",
  "College Area",
  "Hospital Area",
  "Bus Stand",
  "Shanti Nagar",
];

export default function ServiceAreas() {
  return (
    <section className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading
          title="Delivering around your neighbourhood."
          subtitle="We're expanding – check if we serve your area."
        />
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {areas.map((area, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 border border-gray-200 rounded-full shadow-sm"
            >
              <MapPin className="w-5 h-5 text-brand-primary" />
              <span className="font-medium">{area}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="secondary" className="text-lg">
            Check Your Area
          </Button>
        </div>
      </div>
    </section>
  );
}
