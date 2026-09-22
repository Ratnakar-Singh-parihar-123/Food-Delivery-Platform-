import { motion } from "framer-motion";
import SectionHeading from "../../components/common/SectionHeading";
import { offers } from "../../data/offers";
import Button from "../../components/common/Button";

export default function Offers() {
  return (
    <section id="offers" className="py-20 bg-brand-light">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <SectionHeading
          title="Exclusive Offers"
          subtitle="Save more on your favourite meals."
        />
        <div className="grid gap-6 mt-12 md:grid-cols-3">
          {offers.map((offer, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`${offer.bg} rounded-2xl p-6 text-white shadow-lg`}
            >
              <div className="flex flex-col h-full">
                <span className="text-4xl font-bold">{offer.code}</span>
                <p className="mt-2 text-lg">{offer.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-3xl font-extrabold">
                    {offer.discount}
                  </span>
                  <Button variant="outline" className="text-sm">
                    Claim Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
