import jwt from "jsonwebtoken";

const signToken = ({ payload, secret, expiresIn, audience }) => {
  if (!secret) {
    throw new Error(`JWT secret is not configured for ${audience}`);
  }
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn || "7d",
    issuer: "food-delivery-platform",
    audience,
  });
};

// ─── Generic token generator (NEW) ──────────────────────────
export const generateToken = (id, type) => {
  const config = {
    admin: {
      secret: process.env.JWT_ADMIN_SECRET,
      audience: "admin-panel",
      payload: { id, type: "admin", role: "admin" },
    },
    vendor: {
      secret: process.env.JWT_VENDOR_SECRET,
      audience: "vendor-panel",
      payload: { id, type: "vendor" },
    },
    customer: {
      secret: process.env.JWT_CUSTOMER_SECRET,
      audience: "customer-app",
      payload: { id, type: "customer" },
    },
    rider: {
      secret: process.env.JWT_RIDER_SECRET,
      audience: "rider-app",
      payload: { id, type: "rider" },
    },
  };

  const cfg = config[type];
  if (!cfg) {
    throw new Error(`Invalid token type: ${type}`);
  }

  return signToken({
    payload: cfg.payload,
    secret: cfg.secret,
    audience: cfg.audience,
  });
};

// ─── Admin ──────────────────────────────────────────────────
export const generateAdminToken = (admin) => {
  return signToken({
    payload: {
      id: admin._id.toString(),
      role: admin.role || "admin",
      type: "admin",
    },
    secret: process.env.JWT_ADMIN_SECRET,
    expiresIn: process.env.JWT_ADMIN_EXPIRES_IN,
    audience: "admin-panel",
  });
};

// ─── Vendor ──────────────────────────────────────────────────
export const generateVendorToken = (vendor) => {
  return signToken({
    payload: {
      id: vendor._id.toString(),
      type: "vendor",
    },
    secret: process.env.JWT_VENDOR_SECRET,
    expiresIn: process.env.JWT_VENDOR_EXPIRES_IN,
    audience: "vendor-panel",
  });
};

// ─── Customer ──────────────────────────────────────────────
export const generateCustomerToken = (customer) => {
  return signToken({
    payload: {
      id: customer._id.toString(),
      type: "customer",
    },
    secret: process.env.JWT_CUSTOMER_SECRET,
    expiresIn: process.env.JWT_CUSTOMER_EXPIRES_IN,
    audience: "customer-app",
  });
};

// ─── Rider ──────────────────────────────────────────────────
export const generateRiderToken = (rider) => {
  return signToken({
    payload: {
      id: rider._id.toString(),
      type: "rider",
    },
    secret: process.env.JWT_RIDER_SECRET,
    expiresIn: process.env.JWT_RIDER_EXPIRES_IN || "7d",
    audience: "rider-app",
  });
};
