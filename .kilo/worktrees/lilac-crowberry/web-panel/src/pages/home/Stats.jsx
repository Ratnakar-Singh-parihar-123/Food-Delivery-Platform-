import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

// const statsData = [
//   { label: "Partner Restaurants", value: 50, suffix: "+" },
//   { label: "Orders Delivered", value: 10000, suffix: "+" },
//   { label: "Happy Customers", value: 5000, suffix: "+" },
//   { label: "Delivery Partners", value: 25, suffix: "+" },
//   { label: "Average Rating", value: 4.8, suffix: "★" },
// ];

const AnimatedCounter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, target]);

  return (
    <span
      ref={ref}
      className="text-4xl font-bold md:text-5xl text-brand-primary"
    >
      {count}
      {suffix}
    </span>
  );
};

export default function Stats() {
  return (
    <section className="py-20 text-white bg-brand-dark">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-5">
          {statsData.map((stat, idx) => (
            <div key={idx}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}
