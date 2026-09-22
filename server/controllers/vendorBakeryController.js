import BakeryProduct from "../models/BakeryProduct.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getBakeryProducts = asyncHandler(async (req, res) => {
  const { category, isAvailable } = req.query;
  const filter = { vendorId: req.vendor._id };
  if (category) filter.category = category;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

  const products = await BakeryProduct.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { products } });
});

export const addBakeryProduct = asyncHandler(async (req, res) => {
  const { name, description, price, weight, category, customOrder } = req.body;
  if (!name || price === undefined) {
    throw new ApiError(400, "Name and price are required");
  }

  const product = await BakeryProduct.create({
    vendorId: req.vendor._id,
    name,
    description,
    price,
    weight,
    category,
    customOrder,
  });

  res.status(201).json({ success: true, data: { product } });
});

export const updateBakeryProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await BakeryProduct.findOne({
    _id: productId,
    vendorId: req.vendor._id,
  });
  if (!product) throw new ApiError(404, "Product not found");

  const allowed = [
    "name",
    "description",
    "price",
    "weight",
    "category",
    "isAvailable",
    "customOrder",
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  await product.save();
  res.status(200).json({ success: true, data: { product } });
});

export const deleteBakeryProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await BakeryProduct.findOneAndDelete({
    _id: productId,
    vendorId: req.vendor._id,
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json({ success: true, message: "Product deleted" });
});
