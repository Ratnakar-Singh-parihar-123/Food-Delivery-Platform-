// middleware/vendorUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   DIRECTORIES
===================================================== */

const profileDirectory = path.resolve("uploads/vendors/profiles");
const documentDirectory = path.resolve("uploads/vendors/documents");
const menuDirectory = path.resolve("uploads/vendors/menu");
const categoryDirectory = path.resolve("uploads/categories"); // ✅ new

[profileDirectory, documentDirectory, menuDirectory, categoryDirectory].forEach(
  (directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  },
);

/* =====================================================
   REGISTRATION STORAGE
===================================================== */

const registrationStorage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "businessFrontPhoto") {
      cb(null, profileDirectory);
      return;
    }
    cb(null, documentDirectory);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${Date.now()}-${Math.floor(
      Math.random() * 1000000,
    )}${extension}`;
    cb(null, filename);
  },
});

/* =====================================================
   MENU ITEM STORAGE
===================================================== */

const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, menuDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `menu-${uniqueSuffix}${ext}`);
  },
});

/* =====================================================
   PROFILE STORAGE
===================================================== */

const profileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, profileDirectory);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(
      null,
      `vendor-${req.vendor?._id || "unknown"}-${Date.now()}${extension}`,
    );
  },
});

/* =====================================================
   CATEGORY ICON STORAGE
===================================================== */

const categoryIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoryDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `category-${uniqueSuffix}${ext}`);
  },
});

/* =====================================================
   FILE FILTERS
===================================================== */

const registrationFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new ApiError(400, "Only JPG, PNG, WEBP and PDF files are allowed"),
    );
  }
  cb(null, true);
};

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
  }
  cb(null, true);
};

/* =====================================================
   UPLOAD MIDDLEWARES
===================================================== */

// ─── Registration (multiple files) ────────────────────────────
export const uploadVendorRegistration = multer({
  storage: registrationStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: registrationFileFilter,
}).fields([
  { name: "fssaiCertificate", maxCount: 1 },
  { name: "ownerIdProof", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "businessFrontPhoto", maxCount: 1 },
]);

// ─── Profile image (single) ────────────────────────────────────
export const uploadVendorProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single("profileImage");

// ─── Menu item image (single) ─────────────────────────────────
export const uploadVendorMenu = multer({
  storage: menuStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single("image"); // field name expected: 'image'

// ─── ✅ NEW: Category icon image (single) ────────────────────
export const uploadVendorCategoryIcon = multer({
  storage: categoryIconStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single("iconImage"); // field name expected: 'iconImage'
