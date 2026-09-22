import multer from "multer";
import path from "path";
import fs from "fs";

import { ApiError } from "../utils/ApiError.js";

const profileDirectory = path.resolve("uploads/riders/profiles");

const documentDirectory = path.resolve("uploads/riders/documents");

[profileDirectory, documentDirectory].forEach((directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "profileImage") {
      cb(null, profileDirectory);
      return;
    }

    cb(null, documentDirectory);
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const name = `${file.fieldname}-${Date.now()}-${Math.floor(
      Math.random() * 1_000_000,
    )}${extension}`;

    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
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

export const uploadRiderRegistration = multer({
  storage,

  limits: {
    fileSize: 8 * 1024 * 1024,
  },

  fileFilter,
}).fields([
  {
    name: "profileImage",
    maxCount: 1,
  },
  {
    name: "aadhaarFront",
    maxCount: 1,
  },
  {
    name: "aadhaarBack",
    maxCount: 1,
  },
  {
    name: "panCard",
    maxCount: 1,
  },
  {
    name: "drivingLicense",
    maxCount: 1,
  },
  {
    name: "vehicleRc",
    maxCount: 1,
  },
  {
    name: "vehicleInsurance",
    maxCount: 1,
  },
]);

export const uploadRiderProfile = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
  },
}).single("profileImage");
