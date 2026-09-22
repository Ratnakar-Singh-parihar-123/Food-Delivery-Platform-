// ─── Reviews & Ratings Page ──────────────────────────────────────
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  StarHalf,
  User,
  Calendar,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Award,
  Clock,
  LoaderCircle,
  Eye,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  Filter,
} from "lucide-react";

// ─── Dummy Reviews Generator ──────────────────────────────────────
const generateDummyReviews = (count = 12) => {
  const customerNames = [
    "Rahul Sharma",
    "Priya Patel",
    "Amit Singh",
    "Sneha Reddy",
    "Vikram Joshi",
    "Ananya Mehta",
    "Rohit Kumar",
    "Kavya Nair",
    "Arjun Desai",
    "Meera Iyer",
    "Suresh Rao",
    "Lakshmi Menon",
  ];
  const reviewTexts = [
    "Amazing food! The biryani was perfectly cooked and full of flavor. Definitely ordering again!",
    "Great service and delicious food. The paneer tikka was exceptional.",
    "Good quality food but delivery was a bit late. Still, the taste made up for it.",
    "Excellent experience! The butter chicken was the best I've had in a while.",
    "Average food, nothing special. Expected more from the hype.",
    "Fantastic! The garlic bread and pasta were both outstanding.",
    "The food was cold when it arrived, but the taste was good.",
    "Perfect packaging and hot food. The gulab jamun was heavenly!",
    "Not worth the money. Small portions and average taste.",
    "Loved it! The chicken burger was juicy and fresh. Will order again.",
    "Good service and timely delivery. The veg biryani was flavorful.",
    "Amazing experience! The chocolate shake was a perfect end to the meal.",
  ];
  const foodItems = [
    "Margherita Pizza",
    "Chicken Burger",
    "Paneer Tikka",
    "Veg Biryani",
    "Butter Chicken",
    "Garlic Bread",
    "Gulab Jamun",
    "Chocolate Shake",
  ];

  const reviews = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const rating = Math.floor(Math.random() * 5) + 1;
    const orderId = `ORD-${String(2000 + i).padStart(4, "0")}`;
    const createdAt = new Date(
      now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    );

    reviews.push({
      _id: `review_${i}`,
      orderId,
      customerName: customerNames[i % customerNames.length],
      rating,
      reviewText: reviewTexts[i % reviewTexts.length],
      createdAt,
      items: foodItems.slice(0, Math.floor(Math.random() * 3) + 1),
      helpful: Math.floor(Math.random() * 20),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        customerNames[i % customerNames.length],
      )}&background=random&size=32`,
      vendorResponse:
        Math.random() > 0.7
          ? "Thank you for your feedback! We'll work on improving."
          : null,
    });
  }

  return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// ─── Star Rating Component ──────────────────────────────────────
function StarRating({ rating, size = "sm" }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSize} fill-amber-400 text-amber-400`}
        />
      ))}
      {hasHalfStar && (
        <StarHalf className={`${starSize} fill-amber-400 text-amber-400`} />
      )}
      {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map(
        (_, i) => (
          <Star key={`empty-${i}`} className={`${starSize} text-gray-300`} />
        ),
      )}
    </div>
  );
}

// ─── Main Reviews Component ──────────────────────────────────────
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummy = generateDummyReviews(15);
    setReviews(dummy);
    setFilteredReviews(dummy);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = reviews;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.orderId.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q),
      );
    }
    if (ratingFilter > 0) {
      result = result.filter((r) => r.rating === ratingFilter);
    }
    setFilteredReviews(result);
  }, [reviews, searchQuery, ratingFilter]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avgRating =
      total > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
        : 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
    });
    return { total, avgRating, ratingCounts };
  }, [reviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mx-auto space-y-6 max-w-7xl">
      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Star}
          label="Average Rating"
          value={`${stats.avgRating} ★`}
          gradient="from-amber-400 to-yellow-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Reviews"
          value={stats.total}
          gradient="from-blue-400 to-cyan-400"
        />
        <StatCard
          icon={ThumbsUp}
          label="5-Star Reviews"
          value={stats.ratingCounts[5]}
          gradient="from-green-400 to-emerald-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Response Rate"
          value={`${Math.round((reviews.filter((r) => r.vendorResponse).length / reviews.length) * 100)}%`}
          gradient="from-purple-400 to-pink-400"
        />
      </div>

      {/* Rating Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
          Filter:
        </span>
        {[0, 5, 4, 3, 2, 1].map((num) => (
          <button
            key={num}
            onClick={() => setRatingFilter(num)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              ratingFilter === num
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {num === 0 ? "All" : `${num}★`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID or customer name..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredReviews.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 bg-white border border-gray-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 mr-2" />
              No reviews found
            </div>
          ) : (
            filteredReviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setSelectedReview(review)}
                className="p-5 transition-all bg-white border border-gray-200 shadow-sm cursor-pointer rounded-2xl hover:shadow-md hover:border-orange-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start flex-1 min-w-0 gap-4">
                    <img
                      src={review.avatar}
                      alt={review.customerName}
                      className="flex-shrink-0 w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {review.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {review.orderId}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs font-bold text-gray-700">
                          {review.rating}.0
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {review.reviewText}
                      </p>
                      {review.vendorResponse && (
                        <div className="p-3 mt-2 border border-orange-100 rounded-xl bg-orange-50">
                          <p className="text-xs font-medium text-orange-600">
                            Vendor Response:
                          </p>
                          <p className="text-sm text-gray-700">
                            {review.vendorResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center flex-shrink-0 gap-2">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {review.helpful}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {selectedReview && (
          <ReviewDetailModal
            review={selectedReview}
            onClose={() => setSelectedReview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Review Detail Modal ──────────────────────────────────────────
function ReviewDetailModal({ review, onClose }) {
  if (!review) return null;

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
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={review.avatar}
              alt={review.customerName}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-gray-900">
                  {review.customerName}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {review.orderId}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="md" />
                <span className="text-sm font-bold text-gray-700">
                  {review.rating}.0
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {new Date(review.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="p-4 mt-4 border border-gray-100 rounded-xl bg-gray-50">
            <p className="text-sm leading-relaxed text-gray-700">
              {review.reviewText}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Items Ordered
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {review.items.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {review.vendorResponse && (
            <div className="p-4 mt-4 border border-orange-100 rounded-xl bg-orange-50">
              <p className="text-xs font-bold tracking-wider text-orange-600 uppercase">
                Your Response
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {review.vendorResponse}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <ThumbsUp className="w-3.5 h-3.5" />
            {review.helpful} people found this helpful
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── StatCard (reused) ──────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-10`}
      />
      <div className="relative">
        <div
          className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-lg`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
      </div>
    </motion.div>
  );
}
