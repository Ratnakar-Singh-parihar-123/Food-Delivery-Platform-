import { useState, useEffect } from "react";
import { MapPin, Bike, Home, Clock } from "lucide-react";

const statuses = [
  { label: "Order Confirmed", done: true },
  { label: "Restaurant Preparing", done: true },
  { label: "Rider Assigned", done: true },
  { label: "On The Way", done: false },
  { label: "Delivered", done: false },
];

export default function LiveTracking() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 0.5 : 0));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark">
              Live Order Tracking
            </h2>
            <p className="mt-4 text-gray-600">
              See exactly where your order is, every step of the way.
            </p>
            <div className="mt-8 space-y-4">
              {statuses.map((status, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${status.done ? "bg-green-500 border-green-500" : "border-gray-300"}`}
                  >
                    {status.done && (
                      <span className="block w-full h-full text-xs text-center text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    className={`${status.done ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {status.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 p-4 mt-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <Clock className="w-6 h-6 text-brand-primary" />
              {/* <span className="font-medium">Rahul is on the way • 12 min</span> */}
            </div>
          </div>
          <div className="relative overflow-hidden bg-white border border-gray-200 shadow-xl h-80 rounded-2xl">
            <div className="absolute inset-0 p-6 bg-gradient-to-br from-brand-light to-orange-50/30">
              <div className="relative w-full h-full">
                <MapPin className="absolute w-8 h-8 left-1/4 top-1/4 text-brand-primary" />
                <Home className="absolute w-8 h-8 text-green-500 right-1/4 bottom-1/4" />
                <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                  <Bike className="w-10 h-10 text-brand-primary animate-bounce" />
                </div>
                {/* Animated path */}
                <svg className="absolute inset-0 w-full h-full">
                  <line
                    x1="25%"
                    y1="25%"
                    x2="75%"
                    y2="75%"
                    stroke="#e85d3a"
                    strokeWidth="4"
                    strokeDasharray="10 10"
                  />
                  <circle
                    cx={`${25 + progress * 0.5}%`}
                    cy={`${25 + progress * 0.5}%`}
                    r="6"
                    fill="#e85d3a"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
