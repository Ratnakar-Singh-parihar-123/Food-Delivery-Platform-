import { useState } from "react";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="relative px-4 py-2 text-sm text-white bg-brand-primary">
      <div className="flex flex-wrap items-center justify-center gap-2 mx-auto max-w-7xl">
        <span>
          🎉 We're launching in your city — Get special offers on your first
          order
        </span>
        <a
          href="#offers"
          className="font-medium underline-offset-2 hover:underline"
        >
          Explore Offers →
        </a>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute -translate-y-1/2 right-4 top-1/2 text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
