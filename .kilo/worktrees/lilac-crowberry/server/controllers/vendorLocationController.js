import Vendor from "../models/vendor.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import axios from "axios";

// ─── Update vendor address with location ─────────────────
export const updateVendorAddress = asyncHandler(async (req, res) => {
  const { addressLine, landmark, city, state, pincode, latitude, longitude } =
    req.body;

  const vendor = await Vendor.findById(req.vendor._id);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  vendor.address.addressLine = addressLine || vendor.address.addressLine || "";
  vendor.address.landmark = landmark || vendor.address.landmark || "";
  vendor.address.city = city || vendor.address.city || "";
  vendor.address.state = state || vendor.address.state || "";
  vendor.address.pincode = pincode || vendor.address.pincode || "";

  if (latitude !== undefined && longitude !== undefined) {
    vendor.address.location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  } else if (
    latitude === undefined &&
    longitude === undefined &&
    vendor.address.location
  ) {
    // Keep existing location if not provided
  } else {
    // If only one is provided, we might want to clear? Better to require both.
    throw new ApiError(
      400,
      "Both latitude and longitude are required to update location",
    );
  }

  await vendor.save();
  res.status(200).json({ success: true, data: { address: vendor.address } });
});

// ─── Auto‑fetch address from coordinates (reverse geocoding) ──
export const reverseGeocodeVendor = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  // Try Google Geocoding (you need API_KEY)
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  let addressData = {};

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    if (response.data.status === "OK" && response.data.results.length > 0) {
      const result = response.data.results[0];
      const components = result.address_components;
      let city = "",
        state = "",
        pincode = "",
        addressLine = "",
        landmark = "";

      components.forEach((comp) => {
        const types = comp.types;
        if (types.includes("locality")) city = comp.long_name;
        if (types.includes("administrative_area_level_1"))
          state = comp.long_name;
        if (types.includes("postal_code")) pincode = comp.long_name;
        if (types.includes("route")) addressLine = comp.long_name;
        if (types.includes("point_of_interest")) landmark = comp.long_name;
      });

      addressData = { city, state, pincode, addressLine, landmark };
    }
  } catch (error) {
    // Fallback to OpenStreetMap Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await axios.get(url, {
        headers: { "User-Agent": "KhaoJiApp" },
      });
      const data = response.data;
      if (data && data.address) {
        const addr = data.address;
        addressData = {
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
          addressLine: addr.road || "",
          landmark: addr.suburb || "",
        };
      }
    } catch (e) {
      console.warn("Reverse geocoding fallback failed");
    }
  }

  // Update vendor
  const vendor = await Vendor.findById(req.vendor._id);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  vendor.address.addressLine =
    addressData.addressLine || vendor.address.addressLine || "";
  vendor.address.landmark =
    addressData.landmark || vendor.address.landmark || "";
  vendor.address.city = addressData.city || vendor.address.city || "";
  vendor.address.state = addressData.state || vendor.address.state || "";
  vendor.address.pincode = addressData.pincode || vendor.address.pincode || "";

  vendor.address.location = {
    type: "Point",
    coordinates: [Number(lng), Number(lat)],
  };

  await vendor.save();

  res.status(200).json({
    success: true,
    data: { address: vendor.address },
    resolved: addressData,
  });
});
