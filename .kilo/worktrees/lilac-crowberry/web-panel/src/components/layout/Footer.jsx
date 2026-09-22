import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import { HiOutlineHeart } from "react-icons/hi";
import brandLogo from "../../assets/logo/MainBrandLogo.png";

// ─── Constants ──────────────────────────────────────────────
const BRAND_NAME = "FoodMitra";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "For Customers",
    links: [
      { label: "Download App", href: "#download" },
      { label: "Help", href: "#help" },
      { label: "Offers", href: "#offers" },
    ],
  },
  {
    title: "For Partners",
    links: [
      { label: "Add Restaurant", href: "#partners" },
      { label: "Vendor Login", href: "#" },
      { label: "Partner Support", href: "#support" },
    ],
  },
  {
    title: "For Riders",
    links: [
      { label: "Join as Rider", href: "#riders" },
      { label: "Rider Login", href: "#" },
      { label: "Rider Support", href: "#support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#terms" },
      { label: "Privacy", href: "#privacy" },
      { label: "Refund Policy", href: "#refund" },
      { label: "Cancellation Policy", href: "#cancellation" },
    ],
  },
];

// ─── Social Links with Brand Colors ──────────────────────
const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    Icon: FaFacebookF,
    bg: "hover:bg-[#1877F2]",
    border: "hover:border-[#1877F2]",
  },
  {
    label: "X",
    href: "#",
    Icon: FaXTwitter,
    bg: "hover:bg-[#000000]",
    border: "hover:border-[#000000]",
  },
  {
    label: "Instagram",
    href: "#",
    Icon: FaInstagram,
    bg: "hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]",
    border: "hover:border-[#DD2A7B]",
  },
  {
    label: "YouTube",
    href: "#",
    Icon: FaYoutube,
    bg: "hover:bg-[#FF0000]",
    border: "hover:border-[#FF0000]",
  },
];

export default function Footer() {
  return (
    <footer className="relative pt-16 pb-6 overflow-hidden text-gray-300 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* ─── Decorative Glow ──────────────────────────────── */}
      <div className="absolute rounded-full pointer-events-none -top-20 -right-20 w-72 h-72 bg-orange-500/10 blur-3xl" />
      <div className="absolute rounded-full pointer-events-none -bottom-20 -left-20 w-72 h-72 bg-purple-500/10 blur-3xl" />

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* ─── Main Footer Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="">
              <img
                src={brandLogo}
                alt={BRAND_NAME}
                className="object-contain w-auto transition-transform duration-300 h-30 hover:scale-105"
              />
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Your favourite local restaurants, dhabas, bakeries and cafés
              delivered straight to your doorstep.
            </p>

            {/* Social Icons – Enhanced with Brand Colors */}
            <div className="flex items-center gap-2.5 mt-6">
              {socialLinks.map(({ label, href, Icon, bg, border }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className={`group relative flex items-center justify-center w-10 h-10 text-gray-400 transition-all duration-300 border rounded-full border-white/10 bg-white/5 hover:-translate-y-1 hover:text-white ${border} ${bg}`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  {/* ─── Tooltip on hover ───────────────────── */}
                  <span className="absolute px-2 py-0.5 text-[10px] font-medium text-white whitespace-nowrap transition-all duration-200 opacity-0 -top-8 bg-gray-800 rounded group-hover:opacity-100">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="col-span-1">
              <h4 className="mb-4 text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 transition-all duration-200 hover:text-orange-400 hover:pl-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom Bar ───────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 mt-10 text-sm text-gray-500 border-t border-white/10 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with{" "}
            <HiOutlineHeart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>for local food lovers</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
