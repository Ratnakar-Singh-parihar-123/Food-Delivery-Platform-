import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (two folders up)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import MenuItem from "../models/MenuItem.js";
import Category from "../models/VendorCategory.js";

async function assignFoodCategory() {
  // Use either MONGODB_URI or MONGO_URI
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "❌ MongoDB URI not found. Please set MONGODB_URI or MONGO_URI in .env",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const items = await MenuItem.find({ foodCategory: { $exists: false } });
    console.log(`📦 Found ${items.length} items without foodCategory`);

    let updated = 0;
    for (const item of items) {
      if (item.categoryId) {
        const vendorCat = await Category.findById(item.categoryId);
        if (vendorCat?.globalCategory) {
          item.foodCategory = vendorCat.globalCategory;
          await item.save();
          updated++;
          console.log(`✅ Assigned to "${item.name}"`);
        }
      }
    }

    console.log(`✅ Updated ${updated} items`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

assignFoodCategory();
