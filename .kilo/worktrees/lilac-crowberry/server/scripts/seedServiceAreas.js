// scripts/seedServiceAreas.js
import mongoose from "mongoose";
import ServiceArea from "../models/ServiceArea.js";
import dotenv from "dotenv";
dotenv.config();

const areas = [
  {
    name: "Indore City Center",
    location: { type: "Point", coordinates: [75.8577, 22.7196] },
    radius: 8000,
    deliveryCharge: 20,
    minOrderAmount: 100,
    estimatedDeliveryTime: 25,
  },
  {
    name: "Bhopal Main",
    location: { type: "Point", coordinates: [77.4027, 23.2599] },
    radius: 10000,
    deliveryCharge: 25,
    minOrderAmount: 150,
    estimatedDeliveryTime: 30,
  },
  {
    name: "Mumbai Suburbs",
    location: { type: "Point", coordinates: [72.8777, 19.076] },
    radius: 15000,
    deliveryCharge: 30,
    minOrderAmount: 200,
    estimatedDeliveryTime: 40,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await ServiceArea.deleteMany({});
    await ServiceArea.insertMany(areas);
    console.log("✅ Service areas seeded");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}
seed();
