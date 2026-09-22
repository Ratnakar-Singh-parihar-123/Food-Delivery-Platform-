@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");
@import "tailwindcss";

/* Theme variables */
@theme {
  --font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;

  --color-brand-primary: #e85d3a;
  --color-brand-secondary: #f4a261;
  --color-brand-dark: #1a1a2e;
  --color-brand-light: #fdf6f0;

  --animate-float: float 6s ease-in-out infinite;
  --animate-float-slow: float 8s ease-in-out infinite;
  --animate-pulse-ring: pulse-ring 1.5s
    cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Base styles */
@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
  }

  body {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
    overflow-x: hidden;

    @apply bg-brand-light font-sans text-brand-dark antialiased;
  }

  button,
  a,
  input,
  textarea,
  select {
    font: inherit;
  }

  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  ::selection {
    color: white;
    background-color: var(--color-brand-primary);
  }
}

/* Reusable utilities */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .text-balance {
    text-wrap: balance;
  }

  .perspective-1000 {
    perspective: 1000px;
  }

  .glass-card {
    background-color: rgb(255 255 255 / 0.8);
    border: 1px solid rgb(255 255 255 / 0.7);
    box-shadow: 0 20px 50px rgb(15 23 42 / 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}