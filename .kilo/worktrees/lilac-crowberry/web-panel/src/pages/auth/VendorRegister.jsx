import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock,
  Eye,
  EyeOff,
  FileCheck2,
  Headphones,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Store,
  UserRound,
  UtensilsCrossed,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  registerVendorApi,
  reverseGeocodeVendorApi,
} from "../../api/vendorApi";

const steps = [
  { id: 1, title: "Business", description: "Basic business info", icon: Store },
  { id: 2, title: "Owner", description: "Owner details", icon: UserRound },
  { id: 3, title: "Address", description: "Store location", icon: MapPin },
  { id: 4, title: "Timings", description: "Working hours", icon: Clock },
  { id: 5, title: "Bank", description: "Settlement account", icon: Landmark },
  {
    id: 6,
    title: "Account",
    description: "Login credentials",
    icon: LockKeyhole,
  },
];

const benefits = [
  "Reach more local customers",
  "Manage orders from one dashboard",
  "Receive transparent settlements",
  "Get dedicated partner support",
];

const businessTypeOptions = [
  { value: "", label: "Select business type" },
  { value: "restaurant", label: "Restaurant" },
  { value: "dhaba", label: "Dhaba" },
  { value: "bakery", label: "Bakery" },
  { value: "cafe", label: "Café" },
  { value: "tiffin_center", label: "Tiffin Centre" },
  { value: "sweet_shop", label: "Sweet Shop" },
  { value: "fast_food", label: "Fast Food" },
  { value: "cloud_kitchen", label: "Cloud Kitchen" },
  { value: "other", label: "Other" },
];

const foodTypeOptions = [
  { value: "", label: "Select food type" },
  { value: "veg_non_veg", label: "Veg & Non-Veg" },
  { value: "pure_veg", label: "Pure Vegetarian" },
  { value: "non_veg", label: "Non-Vegetarian" },
];

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialForm = {
  businessName: "",
  businessType: "",
  fssaiNumber: "",
  foodType: "",
  ownerFirstName: "",
  ownerLastName: "",
  phone: "",
  email: "",
  panNumber: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  timings: dayOptions.map((day) => ({
    day: day.toLowerCase(),
    openTime: "09:00",
    closeTime: "22:00",
    isClosed: false,
  })),
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  upiId: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export default function VendorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentStep = steps.find((item) => item.id === step);
  const progress = Math.round((step / steps.length) * 100);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTimingChange = (index, field, value) => {
    const updated = [...formData.timings];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, timings: updated }));
  };

  // ─── Validation ──────────────────────────────────────────
  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.businessName.trim() ||
        !formData.businessType ||
        !formData.fssaiNumber.trim() ||
        !formData.foodType
      ) {
        setError("Please complete all required business details.");
        return false;
      }
    }
    if (step === 2) {
      if (
        !formData.ownerFirstName.trim() ||
        !formData.phone.trim() ||
        !formData.email.trim() ||
        !formData.panNumber.trim()
      ) {
        setError("Please complete all required owner details.");
        return false;
      }
    }
    if (step === 3) {
      if (
        !formData.addressLine.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.pincode.trim()
      ) {
        setError("Please complete your business address.");
        return false;
      }
    }
    if (step === 4) {
      for (const t of formData.timings) {
        if (!t.isClosed && (!t.openTime || !t.closeTime)) {
          setError("Set open/close time for days that are not closed.");
          return false;
        }
      }
    }
    if (step === 5) {
      if (
        !formData.accountHolderName.trim() ||
        !formData.accountNumber.trim() ||
        !formData.ifscCode.trim()
      ) {
        setError("Please enter required bank details.");
        return false;
      }
    }
    if (step === 6) {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      if (!formData.acceptTerms) {
        setError("Please accept Partner Terms and Privacy Policy.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step < steps.length) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─── Location ────────────────────────────────────────────
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await reverseGeocodeVendorApi(latitude, longitude);
          const addr = res.data.address;
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            addressLine: addr.addressLine || "",
            landmark: addr.landmark || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
          }));
        } catch {
          setError("Unable to fetch address from location.");
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        }
      },
      () => setError("Unable to fetch current location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ─── Submit ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      setIsSubmitting(true);
      setError("");

      const payload = new FormData();
      payload.append("ownerFirstName", formData.ownerFirstName.trim());
      payload.append("ownerLastName", formData.ownerLastName.trim());
      payload.append("email", formData.email.trim().toLowerCase());
      payload.append("phone", formData.phone.trim());
      payload.append("password", formData.password);
      payload.append("confirmPassword", formData.confirmPassword);
      payload.append("businessName", formData.businessName.trim());
      payload.append("businessType", formData.businessType);
      payload.append("foodType", formData.foodType);
      payload.append("fssaiNumber", formData.fssaiNumber.trim());
      payload.append("panNumber", formData.panNumber.trim().toUpperCase());
      payload.append("addressLine", formData.addressLine.trim());
      payload.append("landmark", formData.landmark.trim());
      payload.append("city", formData.city.trim());
      payload.append("state", formData.state.trim());
      payload.append("pincode", formData.pincode.trim());
      if (formData.latitude) payload.append("latitude", formData.latitude);
      if (formData.longitude) payload.append("longitude", formData.longitude);
      payload.append("timings", JSON.stringify(formData.timings));
      payload.append("accountHolderName", formData.accountHolderName.trim());
      payload.append("accountNumber", formData.accountNumber.trim());
      payload.append("ifscCode", formData.ifscCode.trim().toUpperCase());
      payload.append("bankName", formData.bankName.trim());
      payload.append("upiId", formData.upiId.trim());

      const response = await registerVendorApi(payload);
      navigate("/vendor/pending/Approved", {
        replace: true,
        state: {
          email: response?.data?.email || formData.email,
          vendorId: response?.data?.vendorId,
        },
      });
    } catch (error) {
      console.error(error);
      setError(
        error?.response?.data?.message ||
          "Unable to submit registration. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf7f2]">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-60 -top-40 h-[520px] w-[520px] rounded-full bg-amber-200/35 blur-[150px]" />
        <div className="absolute -bottom-60 right-0 h-[520px] w-[520px] rounded-full bg-orange-100/40 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-100/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="relative flex items-center justify-center text-white shadow-lg h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30">
              <Store className="w-5 h-5" />
              <span className="absolute flex items-center justify-center w-4 h-4 border-2 border-white rounded-full bg-emerald-500 -right-1 -top-1">
                <Check className="w-2 h-2" strokeWidth={4} />
              </span>
            </span>
            <span>
              <span className="block font-extrabold tracking-tight text-gray-950">
                FoodMitra
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                Partner Registration
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:block">
              Already a partner?
            </span>
            <Link
              to="/vendor/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-100 sm:text-sm"
            >
              Partner Login
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-9"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-600 shadow-sm backdrop-blur">
            <UtensilsCrossed className="w-4 h-4" />
            Join our partner network
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
            Grow your food business
            <span className="block text-transparent bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text">
              with more online orders.
            </span>
          </h1>
          <p className="max-w-xl mx-auto mt-4 text-sm leading-6 text-gray-500 sm:text-base">
            Register your restaurant, dhaba, bakery, café, sweet shop, cloud
            kitchen or tiffin centre.
          </p>
        </motion.div>

        {/* Mobile Progress */}
        <div className="p-4 mb-6 bg-white border shadow-sm border-amber-100 rounded-2xl lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                Step {step} of {steps.length}
              </p>
              <p className="mt-1 text-sm font-extrabold text-gray-900">
                {currentStep?.title}
              </p>
            </div>
            <span className="text-sm font-extrabold text-amber-600">
              {progress}%
            </span>
          </div>
          <div className="h-2 mt-3 overflow-hidden rounded-full bg-amber-100">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </div>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[300px_1fr] xl:grid-cols-[330px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <div className="overflow-hidden rounded-[28px] bg-gray-950 p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.2)]">
              <div className="relative">
                <div className="absolute rounded-full -right-20 -top-20 h-52 w-52 bg-amber-500/20 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-amber-400">
                      Registration progress
                    </span>
                    <span className="text-sm font-extrabold">{progress}%</span>
                  </div>
                  <div className="h-2 mt-4 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>

                <div className="relative space-y-2 mt-7">
                  {steps.map((item, index) => {
                    const Icon = item.icon;
                    const completed = step > item.id;
                    const active = step === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id <= step) {
                            setStep(item.id);
                            setError("");
                          }
                        }}
                        className={`relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                          active
                            ? "bg-white text-gray-950 shadow-md"
                            : "text-white/55 hover:bg-white/[0.06]"
                        }`}
                      >
                        {index < steps.length - 1 && (
                          <span
                            className={`absolute left-[29px] top-[48px] h-[14px] w-px ${
                              completed ? "bg-amber-500" : "bg-white/10"
                            }`}
                          />
                        )}
                        <span
                          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                            completed
                              ? "bg-emerald-500 text-white"
                              : active
                                ? "bg-amber-50 text-amber-500"
                                : "bg-white/10 text-white/50"
                          }`}
                        >
                          {completed ? (
                            <Check className="w-4 h-4" strokeWidth={3} />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </span>
                        <span>
                          <span className="block text-xs font-bold">
                            {item.title}
                          </span>
                          <span
                            className={`mt-0.5 block text-[9px] ${
                              active ? "text-gray-400" : "text-white/30"
                            }`}
                          >
                            {item.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t mt-7 border-white/10">
                  <p className="text-xs font-bold">Why partner with us?</p>
                  <div className="mt-4 space-y-3">
                    {benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-2 text-[11px] text-white/50"
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 mt-4 border shadow-sm border-amber-100 rounded-2xl bg-white/80">
              <span className="flex items-center justify-center w-10 h-10 text-amber-500 rounded-xl bg-amber-50">
                <Headphones className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Need registration help?
                </p>
                <button
                  type="button"
                  className="mt-1 text-[10px] font-bold text-amber-600"
                >
                  Contact partner support
                </button>
              </div>
            </div>
          </aside>

          {/* Form */}
          <section className="overflow-hidden rounded-[28px] border border-gray-200/70 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-4 px-5 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/80 to-white sm:px-8">
              <span className="flex items-center justify-center w-12 h-12 text-white shadow-lg shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20">
                {currentStep && <currentStep.icon className="w-5 h-5" />}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500">
                  Step {step} of {steps.length}
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-gray-950 sm:text-xl">
                  {currentStep?.title} information
                </h2>
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              {error && (
                <div className="flex items-start gap-3 p-4 mb-6 text-sm border text-rose-600 border-rose-200 rounded-2xl bg-rose-50/80 animate-shake">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {step === 1 && (
                    <BusinessStep
                      formData={formData}
                      handleChange={handleChange}
                    />
                  )}
                  {step === 2 && (
                    <OwnerStep
                      formData={formData}
                      handleChange={handleChange}
                    />
                  )}
                  {step === 3 && (
                    <AddressStep
                      formData={formData}
                      handleChange={handleChange}
                      getCurrentLocation={getCurrentLocation}
                    />
                  )}
                  {step === 4 && (
                    <TimingsStep
                      timings={formData.timings}
                      onTimingChange={handleTimingChange}
                    />
                  )}
                  {step === 5 && (
                    <BankStep formData={formData} handleChange={handleChange} />
                  )}
                  {step === 6 && (
                    <AccountStep
                      formData={formData}
                      handleChange={handleChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3 pt-6 mt-10 border-t border-gray-100">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={previousStep}
                  className="flex items-center h-12 gap-2 px-4 text-sm font-bold text-gray-600 transition-all bg-white border border-gray-200 rounded-xl hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                {step < steps.length ? (
                  <motion.button
                    type="button"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className="flex items-center h-12 gap-2 px-5 text-sm font-bold text-white transition-all shadow-lg group rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 sm:px-7"
                  >
                    Save and continue
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    disabled={isSubmitting}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex items-center h-12 gap-2 px-5 text-sm font-bold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:px-7"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Registration
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// ─── Step Components ──────────────────────────────────────

function BusinessStep({ formData, handleChange }) {
  return (
    <>
      <StepTitle
        title="Tell us about your business"
        description="Enter the public information customers will see on your store profile."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Business Name"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Sharma Family Dhaba"
          icon={Store}
          required
        />
        <SelectField
          label="Business Type"
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          icon={Building2}
          options={businessTypeOptions}
          required
        />
        <Field
          label="FSSAI Number"
          name="fssaiNumber"
          value={formData.fssaiNumber}
          onChange={handleChange}
          placeholder="Enter licence number"
          icon={BadgeCheck}
          required
        />
        <SelectField
          label="Food Type"
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
          icon={UtensilsCrossed}
          options={foodTypeOptions}
          required
        />
      </div>
    </>
  );
}

function OwnerStep({ formData, handleChange }) {
  return (
    <>
      <StepTitle
        title="Business owner details"
        description="Provide the details of the legal owner or authorised representative."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="First Name"
          name="ownerFirstName"
          value={formData.ownerFirstName}
          onChange={handleChange}
          icon={UserRound}
          required
        />
        <Field
          label="Last Name"
          name="ownerLastName"
          value={formData.ownerLastName}
          onChange={handleChange}
          icon={UserRound}
        />
        <Field
          label="Mobile Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
          type="tel"
          required
        />
        <Field
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          type="email"
          required
        />
        <Field
          label="PAN Number"
          name="panNumber"
          value={formData.panNumber}
          onChange={handleChange}
          icon={FileCheck2}
          required
        />
      </div>
    </>
  );
}

function AddressStep({ formData, handleChange, getCurrentLocation }) {
  return (
    <>
      <StepTitle
        title="Where is your business located?"
        description="This address will be used for customer discovery and rider pickup."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Complete Address"
            name="addressLine"
            value={formData.addressLine}
            onChange={handleChange}
            icon={MapPin}
            required
          />
        </div>
        <Field
          label="Landmark"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          icon={MapPin}
        />
        <Field
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <Field
          label="State"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <Field
          label="Pincode"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
        />
        <Field
          label="Latitude"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          placeholder="e.g. 22.749"
          icon={MapPin}
          optional
        />
        <Field
          label="Longitude"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          placeholder="e.g. 75.894"
          icon={MapPin}
          optional
        />
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex items-center justify-center w-full gap-3 px-4 text-sm font-bold transition-all border-2 border-dashed text-amber-600 border-amber-200 group min-h-16 rounded-2xl bg-amber-50/70 hover:border-amber-400"
          >
            <span className="flex items-center justify-center bg-white shadow-sm h-9 w-9 rounded-xl">
              <MapPin className="w-4 h-4" />
            </span>
            {formData.latitude
              ? "Location selected successfully"
              : "Use current location (or enter manually)"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          {formData.latitude && (
            <p className="mt-2 text-xs text-gray-400">
              📍 {formData.latitude}, {formData.longitude}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function TimingsStep({ timings, onTimingChange }) {
  return (
    <>
      <StepTitle
        title="Working hours"
        description="Set your daily opening and closing times. Toggle 'Closed' for off days."
      />
      <div className="space-y-4">
        {timings.map((t, idx) => (
          <div
            key={t.day}
            className={`flex flex-wrap items-center gap-3 p-4 border rounded-2xl transition-all ${
              t.isClosed
                ? "bg-gray-100/60 border-gray-200/80"
                : "bg-white border-gray-200 hover:border-amber-200"
            }`}
          >
            <span className="w-24 text-sm font-bold text-gray-700 capitalize">
              {t.day}
            </span>
            <div className="flex flex-wrap items-center flex-1 gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-500">
                Open
                <input
                  type="time"
                  value={t.openTime}
                  onChange={(e) =>
                    onTimingChange(idx, "openTime", e.target.value)
                  }
                  disabled={t.isClosed}
                  className={`px-3 py-2 text-sm bg-white border rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 ${
                    t.isClosed ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                Close
                <input
                  type="time"
                  value={t.closeTime}
                  onChange={(e) =>
                    onTimingChange(idx, "closeTime", e.target.value)
                  }
                  disabled={t.isClosed}
                  className={`px-3 py-2 text-sm bg-white border rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 ${
                    t.isClosed ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={t.isClosed}
                  onChange={(e) =>
                    onTimingChange(idx, "isClosed", e.target.checked)
                  }
                  className="w-4 h-4 border-gray-300 rounded text-amber-500 focus:ring-amber-400"
                />
                Closed
              </label>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        All times are in 24‑hour format (HH:MM).
      </p>
    </>
  );
}

function BankStep({ formData, handleChange }) {
  return (
    <>
      <StepTitle
        title="Add your settlement account"
        description="Your order earnings will be transferred to this bank account."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Account Holder Name"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          icon={UserRound}
          required
        />
        <Field
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          icon={Banknote}
          required
        />
        <Field
          label="IFSC Code"
          name="ifscCode"
          value={formData.ifscCode}
          onChange={handleChange}
          icon={Landmark}
          required
        />
        <Field
          label="Bank Name"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          icon={Landmark}
        />
        <Field
          label="UPI ID"
          name="upiId"
          value={formData.upiId}
          onChange={handleChange}
          icon={WalletCards}
          optional
        />
      </div>
    </>
  );
}

function AccountStep({ formData, handleChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <StepTitle
        title="Create your partner account"
        description="Use these credentials to log in to your business dashboard."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          label="Create Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          visible={showPassword}
          onToggle={() => setShowPassword((p) => !p)}
        />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((p) => !p)}
        />
      </div>

      <label className="flex items-start gap-3 p-4 mt-6 transition-colors border border-gray-200 cursor-pointer rounded-2xl bg-gray-50 hover:bg-gray-100/70">
        <input
          name="acceptTerms"
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={handleChange}
          className="mt-1"
        />
        <span className="text-xs leading-5 text-gray-500">
          I confirm that the provided information is correct and agree to the
          Partner Terms and Privacy Policy.
        </span>
      </label>

      <div className="p-5 mt-5 border border-amber-100 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/60">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 bg-white shadow-sm text-amber-500 shrink-0 rounded-xl">
            <FileCheck2 className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-gray-900">
              What happens after submission?
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              First verify your email OTP. After that admin will review your
              details and approve your business.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────
function StepTitle({ title, description }) {
  return (
    <div className="mb-7">
      <h3 className="text-xl font-extrabold tracking-tight text-gray-950 sm:text-2xl">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required,
  optional,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-gray-700">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {optional && (
          <span className="text-[10px] font-medium text-gray-400">
            Optional
          </span>
        )}
      </div>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
        )}
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 ${
            Icon ? "pl-12" : ""
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
  required,
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold text-gray-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`h-14 w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-700 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 ${
            Icon ? "pl-12" : ""
          }`}
        >
          {options.map((option) => (
            <option
              key={option.value || option.label}
              value={option.value}
              disabled={!option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-4 top-1/2" />
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, onChange, visible, onToggle }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold text-gray-700">
        {label}
        <span className="ml-1 text-rose-500">*</span>
      </label>
      <div className="relative group">
        <LockKeyhole className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={visible ? "text" : "password"}
          required
          className="w-full pl-12 pr-12 text-sm transition-all bg-white border border-gray-200 outline-none h-14 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute text-gray-400 transition-colors -translate-y-1/2 right-4 top-1/2 hover:text-amber-500"
        >
          {visible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
