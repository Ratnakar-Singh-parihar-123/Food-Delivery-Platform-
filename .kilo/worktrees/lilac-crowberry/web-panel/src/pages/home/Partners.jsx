import { motion } from "framer-motion";
import SectionHeading from "../../components/common/SectionHeading";
import Button from "../../components/common/Button";
import { TrendingUp, Users, CreditCard, BarChart } from "lucide-react";

export default function Partners() {
  return (
    <section id="partners" className="py-20 text-white bg-brand-dark">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="Grow your business with [BRAND NAME]."
              subtitle="Reach more customers without building your own delivery system."
              className="text-white"
            />
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: Users, label: "Reach nearby customers" },
                { icon: BarChart, label: "Manage orders easily" },
                { icon: TrendingUp, label: "Control your menu" },
                { icon: CreditCard, label: "Track earnings" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl"
                >
                  <item.icon className="w-5 h-5 text-brand-primary" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <Button variant="primary" className="text-lg">
                Become a Partner
              </Button>
              <Button variant="outline" className="text-lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="p-4 border bg-white/10 rounded-2xl backdrop-blur-sm border-white/10">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
                alt="Vendor Dashboard"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
