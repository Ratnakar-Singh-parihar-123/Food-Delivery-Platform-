// components/MobileMenu.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  Store,
  ShieldCheck,
  X,
  Sparkles,
  UserRound,
} from "lucide-react";
import Button from "../common/Button";

export default function MobileMenu({
  navLinks = [],
  onNavigate = () => {},
  onClose = () => {},
  appDownloads = [],
  onDownload = () => {},
}) {
  const [appsOpen, setAppsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div>
            <p className="text-lg font-bold text-gray-900">Menu</p>
            <p className="text-xs text-gray-400">FoodMitra</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-xl hover:bg-orange-50 hover:text-orange-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="p-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => onNavigate(link.href)}
              className="w-full px-4 py-3 font-semibold text-left text-gray-700 transition-colors rounded-xl hover:bg-orange-50 hover:text-orange-600"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Download Apps Section */}
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => setAppsOpen((p) => !p)}
            className="flex items-center justify-between w-full px-4 py-3 font-semibold text-white shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-orange-500/20"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download App
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                appsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {appsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1 overflow-hidden"
            >
              {appDownloads.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onDownload(app)}
                    className="flex items-center w-full gap-3 p-3 text-left transition-colors border border-gray-100 rounded-xl hover:bg-orange-50"
                  >
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                        app.available
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {app.title}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {app.subtitle}
                      </p>
                    </div>
                    {app.available ? (
                      <Download className="w-4 h-4 text-orange-500" />
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-gray-400 rounded-full">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Login Buttons */}
        <div className="p-4 pt-0 space-y-2">
          <p className="flex items-center gap-1.5 px-1 pb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            <Sparkles className="w-3 h-3" />
            Partner Access
          </p>

          <button
            type="button"
            onClick={() => onNavigate("/vendor/login")}
            className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200"
          >
            <Store className="w-4 h-4 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">
                Vendor Login
              </p>
              <p className="text-[11px] text-gray-400">Manage your business</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/admin/login")}
            className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200"
          >
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Admin Login</p>
              <p className="text-[11px] text-gray-400">Manage the platform</p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
