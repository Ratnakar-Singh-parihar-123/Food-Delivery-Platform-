import TiffinPlan from "../models/TiffinPlan.js";
import DailyMenu from "../models/DailyMenu.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ─── TIFFIN PLANS ──────────────────────────────────────────

export const getTiffinPlans = asyncHandler(async (req, res) => {
  const plans = await TiffinPlan.find({ vendorId: req.vendor._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: { plans } });
});

export const addTiffinPlan = asyncHandler(async (req, res) => {
  const { name, description, price, durationDays, mealsPerDay } = req.body;
  if (!name || price === undefined || !durationDays) {
    throw new ApiError(400, "Name, price and durationDays are required");
  }

  const plan = await TiffinPlan.create({
    vendorId: req.vendor._id,
    name,
    description,
    price,
    durationDays,
    mealsPerDay,
  });

  res.status(201).json({ success: true, data: { plan } });
});

export const updateTiffinPlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const plan = await TiffinPlan.findOne({
    _id: planId,
    vendorId: req.vendor._id,
  });
  if (!plan) throw new ApiError(404, "Plan not found");

  const allowed = [
    "name",
    "description",
    "price",
    "durationDays",
    "mealsPerDay",
    "isActive",
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) plan[field] = req.body[field];
  });

  await plan.save();
  res.status(200).json({ success: true, data: { plan } });
});

export const deleteTiffinPlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const plan = await TiffinPlan.findOneAndDelete({
    _id: planId,
    vendorId: req.vendor._id,
  });
  if (!plan) throw new ApiError(404, "Plan not found");
  res.status(200).json({ success: true, message: "Plan deleted" });
});

// ─── DAILY MENUS ──────────────────────────────────────────

export const getDailyMenu = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const queryDate = date ? new Date(date) : new Date();
  queryDate.setHours(0, 0, 0, 0);

  const menu = await DailyMenu.findOne({
    vendorId: req.vendor._id,
    date: queryDate,
  });

  res
    .status(200)
    .json({ success: true, data: { menu: menu || { items: [] } } });
});

export const upsertDailyMenu = asyncHandler(async (req, res) => {
  const { date, items } = req.body;
  if (!date || !Array.isArray(items)) {
    throw new ApiError(400, "Date and items array are required");
  }

  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);

  const menu = await DailyMenu.findOneAndUpdate(
    { vendorId: req.vendor._id, date: queryDate },
    { items },
    { new: true, upsert: true },
  );

  res.status(200).json({ success: true, data: { menu } });
});

export const deleteDailyMenu = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);

  const result = await DailyMenu.findOneAndDelete({
    vendorId: req.vendor._id,
    date: queryDate,
  });

  if (!result) throw new ApiError(404, "No menu found for this date");
  res.status(200).json({ success: true, message: "Daily menu deleted" });
});
