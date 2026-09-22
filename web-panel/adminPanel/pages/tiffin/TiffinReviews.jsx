// src/pages/admin/TiffinReviews.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Trash2, EyeOff, Eye, Store, User } from "lucide-react";
import {
  getAllReviews,
  hideReview,
  deleteReview,
} from "../../../src/api/adminApi";

export default function TiffinReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, hidden, visible

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { vendorType: "tiffin_center" };
      if (filter === "hidden") params.isHidden = true;
      else if (filter === "visible") params.isHidden = false;
      const res = await getAllReviews(params);
      setReviews(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async (id) => {
    if (!confirm("Hide this review?")) return;
    await hideReview(id);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    await deleteReview(id);
    loadData();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black">Tiffin House Reviews</h1>
      <div className="flex gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "all" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("visible")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "visible" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
        >
          Visible
        </button>
        <button
          onClick={() => setFilter("hidden")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "hidden" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
        >
          Hidden
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="flex items-start justify-between p-4 bg-white shadow rounded-xl"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {review.houseId?.businessName || "Unknown"}
                  </span>
                  <span className="text-gray-400">|</span>
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {review.customerId?.name || "Anonymous"}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {review.isHidden ? (
                  <button
                    onClick={() => handleHide(review._id)}
                    className="p-2 text-gray-400 hover:text-orange-600"
                    title="Unhide"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleHide(review._id)}
                    className="p-2 text-gray-400 hover:text-orange-600"
                    title="Hide"
                  >
                    <EyeOff className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No reviews found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
