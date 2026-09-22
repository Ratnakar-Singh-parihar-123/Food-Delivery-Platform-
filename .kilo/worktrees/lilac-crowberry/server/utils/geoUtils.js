import Rider from "../models/rider.js";
import Order from "../models/order.js"; // Agar file ka naam order.js hai to uske hisaab se change kar lena

// =======================================================
// Calculate distance between two coordinates (KM)
// =======================================================

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// =======================================================
// Find nearest rider
// =======================================================

export const findNearbyRiders = async (
  locationCoords,
  radiusKm = 2,
  vendorId = null,
) => {
  const [lng, lat] = locationCoords;

  const maxDistance = radiusKm * 1000;

  const query = {
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance,
      },
    },
    isOnline: true,
    isAvailable: true,
    approvalStatus: "approved",
    isActive: true,
    isBlocked: false,
  };

  // Vendor filter (optional)
  if (vendorId) {
    query.vendorId = vendorId;
  }

  const rider = await Rider.findOne(query);

  return rider;
};

// =======================================================
// Generate Unique Order Number
// =======================================================

export const generateOrderNumber = async () => {
  while (true) {
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const exists = await Order.exists({
      orderNumber,
    });

    if (!exists) {
      return orderNumber;
    }
  }
};
