import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Wallet,
  Banknote,
  Plus,
  Edit2,
  Save,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  Building2,
  User,
  Hash,
  CreditCard,
} from "lucide-react";
import {
  getVendorDashboardApi,
  getVendorProfileApi,
  //   updateVendorBusinessApi,
} from "../../src/api/vendorApi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Toast System ──────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed z-50 flex flex-col w-full max-w-sm gap-2 pointer-events-none top-4 right-4">
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`pointer-events-auto rounded-xl p-4 shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Bank Account Modal ──────────────────────────────────
function BankAccountModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        accountHolderName: account.accountHolderName || "",
        bankName: account.bankName || "",
        accountNumber: account.accountNumber || "",
        ifscCode: account.ifscCode || "",
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.accountHolderName ||
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.ifscCode
    ) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      // Simulate API call – replace with actual updateBankAccountApi if available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // For demo, we pass the data back
      onSave(formData);
    } catch (error) {
      alert("Failed to save bank account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 text-orange-500 rounded-lg bg-orange-50">
            <Banknote className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {account ? "Update Bank Account" : "Add Bank Account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Account Holder Name *
            </label>
            <div className="relative">
              <User className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Bank Name *
            </label>
            <div className="relative">
              <Building2 className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Account Number *
            </label>
            <div className="relative">
              <CreditCard className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
              IFSC Code *
            </label>
            <div className="relative">
              <Hash className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              Save Account
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function VendorEarnings() {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    history: [], // [{date, amount}]
  });
  const [bankAccount, setBankAccount] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);

  // ─── Toast helpers ──────────────────────────────────────
  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Fetch data ──────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard earnings
      const dashboardRes = await getVendorDashboardApi();
      const dashData = dashboardRes?.data || dashboardRes;
      // Extract earnings (adapt to your actual API structure)
      setEarnings({
        today: dashData.earnings?.today || 0,
        week: dashData.earnings?.week || 0,
        month: dashData.earnings?.month || 0,
        total: dashData.earnings?.total || 0,
        history: dashData.earnings?.history || generateDummyHistory(),
      });

      // Fetch profile for bank account
      const profileRes = await getVendorProfileApi();
      const profileData =
        profileRes?.data?.vendor || profileRes?.data || profileRes;
      if (profileData?.bankAccount) {
        setBankAccount(profileData.bankAccount);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load earnings", "error");
      // Fallback dummy data
      setEarnings({
        today: 4500,
        week: 28000,
        month: 120000,
        total: 450000,
        history: generateDummyHistory(),
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate dummy history for demo ──────────────────
  const generateDummyHistory = () => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const day = date.toLocaleDateString("en-IN", { weekday: "short" });
      const amount = Math.floor(Math.random() * 5000) + 1000;
      data.push({ date: day, amount });
    }
    return data;
  };

  // ─── Save bank account (mock) ──────────────────────────
  const handleSaveBankAccount = async (accountData) => {
    try {
      // Simulate API call to update bank account (you can use updateVendorBusinessApi or a dedicated endpoint)
      await new Promise((resolve) => setTimeout(resolve, 800));
      setBankAccount(accountData);
      showToast("Bank account saved successfully");
      setShowBankModal(false);
    } catch (error) {
      showToast("Failed to save bank account", "error");
    }
  };

  // ─── Loading skeleton ──────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl px-4 py-8 mx-auto space-y-8">
        <div className="h-32 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="bg-gray-200 h-72 rounded-2xl animate-pulse" />
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto space-y-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden shadow-md rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        <div className="absolute w-64 h-64 rounded-full -top-24 -right-24 bg-orange-300/30 blur-3xl" />
        <div className="absolute w-64 h-64 rounded-full -bottom-24 -left-24 bg-orange-400/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8 backdrop-blur-sm">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
            >
              Earnings
            </motion.h1>
            <p className="text-sm text-gray-600">
              Track your revenue and manage your bank account
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Today"
          value={earnings.today}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="This Week"
          value={earnings.week}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="This Month"
          value={earnings.month}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          label="Total"
          value={earnings.total}
          icon={Wallet}
          color="orange"
        />
      </div>

      {/* ─── Chart ────────────────────────────────────────── */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h2 className="mb-4 text-sm font-bold tracking-wider text-gray-400 uppercase">
          Last 7 Days Earnings
        </h2>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earnings.history}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `₹${value}`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Bank Account ────────────────────────────────── */}
      <div className="p-6 space-y-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 text-orange-500 rounded-lg bg-orange-50">
              <Banknote className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Bank Account</h2>
          </div>
          <button
            onClick={() => setShowBankModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors bg-orange-500 rounded-xl hover:bg-orange-600"
          >
            {bankAccount ? (
              <Edit2 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {bankAccount ? "Update" : "Add"}
          </button>
        </div>

        {bankAccount ? (
          <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-xl sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Account Holder
              </p>
              <p className="font-medium text-gray-900">
                {bankAccount.accountHolderName}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Bank Name
              </p>
              <p className="font-medium text-gray-900">
                {bankAccount.bankName}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Account Number
              </p>
              <p className="font-medium text-gray-900">
                •••• {bankAccount.accountNumber.slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                IFSC Code
              </p>
              <p className="font-medium text-gray-900">
                {bankAccount.ifscCode}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Banknote className="w-12 h-12 mb-2" />
            <p className="text-sm">No bank account linked</p>
            <p className="text-xs">Add your bank details to receive payouts</p>
          </div>
        )}
      </div>

      {/* ─── Bank Account Modal ──────────────────────────── */}
      {showBankModal && (
        <BankAccountModal
          account={bankAccount}
          onClose={() => setShowBankModal(false)}
          onSave={handleSaveBankAccount}
        />
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = "orange" }) {
  const colorClasses = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-500",
    blue: "bg-blue-50 text-blue-500",
    purple: "bg-purple-50 text-purple-500",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className={`p-2 rounded-full ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900">
          ₹{value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
