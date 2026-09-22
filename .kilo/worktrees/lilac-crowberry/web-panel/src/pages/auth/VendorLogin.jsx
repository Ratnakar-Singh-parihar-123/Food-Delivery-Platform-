import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  Headphones,
  LoaderCircle,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";

import { loginVendorApi } from "../../api/vendorApi";
import { useVendor } from "../../../src/context/VendorContext";
import brandlogo from "../../assets/logo/MainBrandLogo.png";

const businessFeatures = [
  {
    icon: ShoppingBag,
    title: "Manage Orders",
    description: "Accept and track orders",
  },
  {
    icon: BarChart3,
    title: "View Analytics",
    description: "Understand performance",
  },
  {
    icon: WalletCards,
    title: "Track Earnings",
    description: "Transparent settlements",
  },
];

export default function VendorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useVendor();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifiedMessage = location.state?.verified
    ? "Email verified successfully. You can login now."
    : "";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const identifier = formData.identifier.trim();
    if (!identifier) {
      setError("Please enter your email or mobile number.");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginVendorApi({
        email: identifier,
        password: formData.password,
        rememberMe,
      });

      const vendor = response?.data?.vendor;
      const token = response?.data?.token || response?.token;

      if (!vendor) {
        throw new Error("Vendor information was not received from server.");
      }

      login(vendor, token);

      if (vendor.approvalStatus === "pending") {
        navigate("/vendor/pending", { replace: true });
        return;
      }
      if (vendor.approvalStatus === "rejected") {
        navigate("/vendor/pending", {
          replace: true,
          state: { rejected: true, reason: vendor.rejectionReason || "" },
        });
        return;
      }

      navigate("/vendor/dashboard", { replace: true });
    } catch (error) {
      console.error("VENDOR LOGIN ERROR:", error?.response?.data || error);

      const data = error?.response?.data;
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/vendor/verify/email", {
          state: { email: data?.data?.email || formData.identifier },
        });
        return;
      }

      setError(
        data?.message || error?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf6]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-orange-200/45 blur-[120px]" />
        <div className="absolute -bottom-52 left-1/3 h-[500px] w-[500px] rounded-full bg-red-100/40 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT PANEL – Fixed layout */}
        <section className="relative hidden min-h-screen overflow-hidden bg-gray-950 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=90"
            alt="Restaurant business partner"
            className="absolute inset-0 object-cover w-full h-full"
          />
          {/* Overlays */}
          <div className="absolute inset-0" />
          {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/75 to-orange-950/60" /> */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" /> */}
          {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" /> */}
          {/* <div className="pointer-events-none absolute -left-48 top-1/4 h-[480px] w-[480px] rounded-full bg-orange-500/20 blur-[120px]" /> */}
          {/* <div className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-red-500/20 blur-[110px]" /> */}

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top: Logo */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-2"
            >
              <img
                src={brandlogo}
                alt="Foodmitra"
                className="object-contain w-auto h-40 drop-shadow-2xl"
              />
            </motion.div>

            {/* Middle: Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-col justify-center flex-1 max-w-xl py-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-orange-300 backdrop-blur w-fit">
                <Sparkles className="w-4 h-4" />
                Grow your food business
              </span>

              <h2 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.035em] text-white xl:text-5xl">
                More orders.
                <span className="block text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text">
                  More customers.
                </span>
                More growth.
              </h2>

              <p className="max-w-lg mt-5 text-base leading-7 text-white/70">
                Manage your menu, incoming orders, business performance and
                settlements from one powerful partner dashboard.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-3 gap-3 mt-8">
                {businessFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl xl:p-4"
                    >
                      <span className="flex items-center justify-center text-orange-400 h-9 w-9 rounded-xl bg-orange-500/15">
                        <Icon className="w-4 h-4" />
                      </span>
                      <p className="mt-3 text-xs font-bold text-white xl:text-sm">
                        {feature.title}
                      </p>
                      <p className="mt-1 hidden text-[10px] leading-4 text-white/40 xl:block">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Bottom: Footer */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-between pt-6 text-xs border-t border-white/10 text-white/35"
            >
              <p>Restaurant • Dhaba • Bakery • Café • Tiffin</p>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                <span>Secure partner access</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* RIGHT LOGIN */}
        <section className="relative flex items-center justify-center min-h-screen px-5 py-12 sm:px-8 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[470px]"
          >
            {/* Mobile brand */}
            <div className="flex items-center justify-between mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center text-white shadow-lg h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900">FoodMitra</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Business Partner
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-600">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Partner login
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Welcome back, Partner
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Sign in to manage your business, orders, menu and earnings.
              </p>
            </div>

            {verifiedMessage && (
              <div className="px-4 py-3 mt-6 text-sm font-semibold text-green-700 border border-green-200 rounded-2xl bg-green-50">
                {verifiedMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mt-9">
              {error && (
                <div className="flex items-start gap-3 p-4 text-sm text-red-600 border border-red-200 rounded-2xl bg-red-50">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="vendor-identifier"
                  className="block mb-2 text-sm font-bold text-gray-700"
                >
                  Email or mobile number
                </label>
                <div className="relative group">
                  <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-orange-500" />
                  <input
                    id="vendor-identifier"
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter email or mobile number"
                    autoComplete="username"
                    className="w-full pl-12 pr-4 text-sm text-gray-800 transition-all border border-gray-200 outline-none h-14 rounded-2xl bg-white/90 placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="vendor-password"
                    className="text-sm font-bold text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/vendor/forgot-password")}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <LockKeyhole className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-orange-500" />
                  <input
                    id="vendor-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 text-sm text-gray-800 transition-all border border-gray-200 outline-none h-14 rounded-2xl bg-white/90 placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-orange-500"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="flex items-center justify-center w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:border-orange-500 peer-checked:bg-orange-500">
                  {rememberMe && (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />
                  )}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  Keep me signed in
                </span>
              </label>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { y: -2, scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white shadow-[0_15px_35px_rgba(249,115,22,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Login to Business Panel
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="p-4 border border-orange-100 mt-7 rounded-2xl bg-orange-50/70">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 text-orange-500 bg-white shadow-sm shrink-0 rounded-xl">
                  <Store className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800">
                    Want to grow your food business?
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Register your business and start receiving orders.
                  </p>
                </div>
                <Link
                  to="/vendor/register"
                  className="flex items-center justify-center text-white bg-orange-500 rounded-full shadow-md h-9 w-9 shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">
                Don&apos;t have a partner account?
              </span>
              <Link
                to="/vendor/register"
                className="ml-1 text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                Register your business
              </Link>
            </div>

            <div className="flex items-center justify-center gap-5 pt-6 border-t mt-7 border-gray-200/80">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                Verified partners
              </span>
              <span className="w-px h-4 bg-gray-200" />
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-600"
              >
                <Headphones className="w-4 h-4 text-orange-500" />
                Partner support
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
