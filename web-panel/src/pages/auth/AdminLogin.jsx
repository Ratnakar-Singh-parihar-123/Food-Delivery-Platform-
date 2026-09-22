import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import brandLogo from "../../assets/logo/MainBrandLogo.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, admin, adminLoading } = useAdmin();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adminLoading && admin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [admin, adminLoading, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = formData.email.trim();
    const password = formData.password;
    setError("");

    if (!email) {
      setError("Email address is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(result.error || "Unable to login. Please try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf6]">
      {/* Background – unchanged */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-orange-200/45 blur-[120px]" />
        <div className="absolute -bottom-52 left-1/3 h-[500px] w-[500px] rounded-full bg-red-100/50 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left visual section */}
        <section className="relative hidden min-h-screen overflow-hidden bg-gray-950 lg:block">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqjU94iLA5f36n5Q-eB4DHtQLfsboU3HUywkFnbUzlNHqV2U7j436gY-E&s=10"
            alt="Food delivery platform administration"
            className="absolute inset-0 object-cover w-full h-full"
          />

          <div className="relative z-10 flex flex-col justify-between min-h-screen p-10\ xl:p-14">
            {/* Brand – logo in original colours */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={brandLogo}
                  alt="Brand Logo"
                  className="object-contain w-auto h-30" // ✅ No filters – original colours
                />

                {/* <span className="text-xs font-bold tracking-widest uppercase text-white/60">
                  Admin
                </span> */}
              </div>
            </motion.div>

            {/* Main visual content – unchanged */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-xl py-12"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-300 backdrop-blur">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 bg-green-400 rounded-full" />
                </span>
                Platform operations live
              </span>
              <h2 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.035em] text-white xl:text-5xl">
                Control your entire
                <span className="block text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text">
                  food delivery ecosystem.
                </span>
              </h2>
              <p className="max-w-lg mt-5 text-base leading-7 text-orange-600">
                Manage vendors, delivery partners, customers, orders, payments
                and live operations from one secure dashboard.
              </p>
            </motion.div>

            {/* Footer – unchanged */}
            <div className="flex items-center justify-between pt-6 text-xs border-t border-white/10 text-white/35">
              <p>&copy; 2026 YourBrand</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                Secure admin access
              </div>
            </div>
          </div>
        </section>

        {/* Right login section – unchanged */}
        <section className="relative flex items-center justify-center min-h-screen px-5 py-12 sm:px-8 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[470px]"
          >
            {/* Mobile Logo – already correct */}
            <div className="flex items-center justify-between mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <img
                  src={brandLogo}
                  alt="Brand Logo"
                  className="object-contain w-auto h-10"
                />
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Admin
                </span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Secure
              </span>
            </div>

            {/* Heading – unchanged */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-600">
                <LockKeyhole className="h-3.5 w-3.5" />
                Administrator access
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Enter your administrator credentials to access the platform
                control center.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-9">
              {/* Email – unchanged */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block mb-2 text-sm font-bold text-gray-700"
                >
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute w-5 h-5 text-gray-400 transition-colors -translate-y-1/2 left-4 top-1/2 group-focus-within:text-orange-500" />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 text-sm text-gray-800 transition-all border border-gray-200 outline-none h-14 rounded-2xl bg-white/90 placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Password – unchanged */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-bold text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/forgot-password")}
                    className="text-xs font-bold text-orange-600 transition-colors hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <LockKeyhole className="absolute w-5 h-5 text-gray-400 transition-colors -translate-y-1/2 left-4 top-1/2 group-focus-within:text-orange-500" />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 text-sm text-gray-800 transition-all border border-gray-200 outline-none h-14 rounded-2xl bg-white/90 placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute text-gray-400 transition-colors -translate-y-1/2 right-4 top-1/2 hover:text-orange-500 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error – unchanged */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-2xl bg-red-50"
                >
                  {error}
                </motion.div>
              )}

              {/* Remember Me – unchanged */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={loading}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="flex items-center justify-center w-5 h-5 transition-all bg-white border-2 border-gray-300 rounded-md peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-disabled:opacity-60">
                  {rememberMe && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  )}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  Keep me signed in on this device
                </span>
              </label>

              {/* Submit – unchanged */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { y: -2, scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white shadow-[0_15px_35px_rgba(249,115,22,0.3)] transition-all hover:shadow-[0_20px_45px_rgba(249,115,22,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Login to Admin Console
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Security Notice – unchanged */}
            <div className="flex items-start gap-3 p-4 border border-orange-100 mt-7 rounded-2xl bg-orange-50/70">
              <span className="flex items-center justify-center text-orange-500 bg-white shadow-sm h-9 w-9 shrink-0 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-700">
                  Restricted administrator portal
                </p>
                <p className="mt-1 text-[11px] leading-5 text-gray-500">
                  Access is monitored. Only authorised platform administrators
                  are permitted to sign in.
                </p>
              </div>
            </div>

            <p className="text-xs text-center text-gray-400 mt-7">
              Having trouble signing in?{" "}
              <button
                type="button"
                className="font-bold text-orange-600 hover:text-orange-700"
              >
                Contact technical support
              </button>
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
