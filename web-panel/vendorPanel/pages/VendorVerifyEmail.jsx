import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";

import {
  verifyVendorEmailApi,
  resendVendorOtpApi,
} from "../../src/api/vendorApi";

export default function VendorVerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [seconds, setSeconds] = useState(60);

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  /* =====================================================
     MASK EMAIL
  ===================================================== */

  const maskedEmail = useMemo(() => {
    if (!email.includes("@")) {
      return email;
    }

    const [name, domain] = email.split("@");

    if (name.length <= 2) {
      return `${name[0] || ""}***@${domain}`;
    }

    return `${name.slice(0, 2)}***@${domain}`;
  }, [email]);

  /* =====================================================
     OTP INPUT
  ===================================================== */

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);
    setError("");
  };

  /* =====================================================
     VERIFY
  ===================================================== */

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email address is missing.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await verifyVendorEmailApi({
        email: email.trim().toLowerCase(),

        otp,
      });

      setSuccess(response?.message || "Email verified successfully.");

      setTimeout(() => {
        navigate("/vendor/login", {
          replace: true,

          state: {
            verified: true,
          },
        });
      }, 700);
    } catch (error) {
      console.error("VENDOR VERIFY ERROR:", error?.response?.data || error);

      setError(error?.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESEND OTP
  ===================================================== */

  const handleResend = async () => {
    if (seconds > 0) {
      return;
    }

    if (!email.trim()) {
      setError("Email address is missing.");
      return;
    }

    try {
      setResending(true);
      setError("");
      setSuccess("");

      const response = await resendVendorOtpApi({
        email: email.trim().toLowerCase(),
      });

      setSuccess(response?.message || "New OTP sent successfully.");

      setOtp("");
      setSeconds(60);
    } catch (error) {
      console.error("VENDOR RESEND OTP ERROR:", error?.response?.data || error);

      setError(error?.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf6] px-4 py-10">
      {/* BACKGROUND */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-orange-200/50 blur-[130px]" />

        <div className="absolute -bottom-48 right-0 h-[480px] w-[480px] rounded-full bg-red-100/60 blur-[130px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.055)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative w-full max-w-[500px]"
      >
        {/* BRAND */}

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="relative flex items-center justify-center w-12 h-12 text-white shadow-lg rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200">
            <Store className="w-6 h-6" />

            <span className="absolute flex items-center justify-center w-4 h-4 bg-green-500 border-2 border-white rounded-full -right-1 -top-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
            </span>
          </span>

          <div>
            <p className="font-black text-gray-950">[BRAND NAME]</p>

            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              Business Partner
            </p>
          </div>
        </div>

        {/* CARD */}

        <section className="overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
          <div className="text-center border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-red-50 p-7 sm:p-9">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200">
              <Mail className="h-7 w-7" />
            </span>

            <h1 className="mt-5 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
              Verify your email
            </h1>

            <p className="max-w-sm mx-auto mt-3 text-sm leading-6 text-gray-500">
              We sent a 6-digit verification code to
            </p>

            <p className="mt-1 text-sm font-extrabold text-gray-900">
              {maskedEmail || "your email address"}
            </p>
          </div>

          <form onSubmit={handleVerify} className="p-6 sm:p-8">
            {/* EMAIL FALLBACK */}

            {!emailFromState && (
              <div className="mb-5">
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      setError("");
                    }}
                    placeholder="partner@example.com"
                    className="w-full pl-12 pr-4 text-sm transition-all border border-gray-200 outline-none h-14 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>
            )}

            {/* OTP */}

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Verification Code
              </label>

              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="h-16 w-full rounded-2xl border border-gray-200 bg-gray-50 text-center text-2xl font-black tracking-[0.45em] text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />

              <div className="flex items-center justify-between gap-3 mt-3">
                <p className="text-xs text-gray-400">
                  OTP is valid for a limited time.
                </p>

                <button
                  type="button"
                  disabled={seconds > 0 || resending}
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {resending ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}

                  {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 p-4 mt-5 text-sm text-red-600 border border-red-200 rounded-2xl bg-red-50">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

                <p>{error}</p>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="flex items-start gap-3 p-4 mt-5 text-sm font-semibold text-green-700 border border-green-200 rounded-2xl bg-green-50">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <p>{success}</p>
              </div>
            )}

            {/* VERIFY BUTTON */}

            <motion.button
              type="submit"
              disabled={loading || otp.length !== 6}
              whileHover={
                loading
                  ? {}
                  : {
                      y: -2,
                    }
              }
              whileTap={
                loading
                  ? {}
                  : {
                      scale: 0.98,
                    }
              }
              className="flex items-center justify-center w-full gap-2 mt-6 font-bold text-white shadow-lg h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* SECURITY */}

            <div className="flex items-start gap-3 p-4 mt-5 rounded-2xl bg-gray-50">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />

              <p className="text-xs leading-5 text-gray-500">
                Never share your OTP with anyone. Our team will never ask for
                your verification code.
              </p>
            </div>

            <div className="flex items-center justify-between pt-5 mt-6 border-t border-gray-100">
              <Link
                to="/vendor/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-orange-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to registration
              </Link>

              <Link
                to="/vendor/login"
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                Partner Login
              </Link>
            </div>
          </form>
        </section>
      </motion.div>
    </main>
  );
}
