import { useEffect, useRef } from "react";

export default function useScrollAnimation(animationCallback) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationCallback(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animationCallback]);
  return ref;
}
