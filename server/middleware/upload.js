// middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Ensure base upload directories exist ──────────────
const baseUploads = path.join(__dirname, "..", "uploads");
[
  "admin",
  "vendors/menu",
  "icons",
  "categories",
  "riders",
  "users",
  "documents",
].forEach((sub) => {
  const dir = path.join(baseUploads, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Admin profile upload ──────────────────────────────
const adminStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(baseUploads, "admin"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      `admin-${req.admin?._id || "profile"}-` +
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

// ─── Menu item upload ──────────────────────────────────
const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(baseUploads, "vendors/menu"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `menu-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

// ─── Predefined icons (admin managed) ──────────────────
const iconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(baseUploads, "icons"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `icon-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

// ─── Category icons (vendor uploaded) ──────────────────
const categoryIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(baseUploads, "categories"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `category-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

// ─── Generic upload (for rider documents, etc.) ─────────
const genericStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "users";
    if (req.user?.type === "rider") folder = "riders";
    else if (req.user?.type === "vendor") folder = "vendors";
    else if (req.user?.type === "admin") folder = "admin";
    if (file.fieldname === "document") folder = "documents";
    const fullPath = path.join(baseUploads, folder);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

// ─── File filter ──────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new ApiError(400, "Only JPG, JPEG, PNG and WEBP images are allowed"),
      false,
    );
  }
  cb(null, true);
};

const limits = {
  fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
};

// ─── Exports ──────────────────────────────────────────────
export const uploadAdminProfile = multer({
  storage: adminStorage,
  limits,
  fileFilter,
}).single("profileImage");

export const uploadVendorMenu = multer({
  storage: menuStorage,
  limits,
  fileFilter,
}).single("image");

export const uploadIconImage = multer({
  storage: iconStorage,
  limits,
  fileFilter,
}).single("image");

export const uploadCategoryIcon = multer({
  storage: categoryIconStorage,
  limits,
  fileFilter,
}).single("image");

// ✅ Alias for admin category upload (matches your route import)
export const uploadCategoryImage = uploadCategoryIcon;

// ─── Generic upload middleware ──────────────────────────
export const upload = multer({
  storage: genericStorage,
  limits,
  fileFilter,
});
