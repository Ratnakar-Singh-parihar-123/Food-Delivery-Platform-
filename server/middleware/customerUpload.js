import multer from "multer";
import fs from "fs";
import path from "path";

import { ApiError } from "../utils/ApiError.js";

const uploadDirectory = path.resolve("uploads/customers");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,

      `customer-${req.customer._id}-${Date.now()}${extension}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
  }

  cb(null, true);
};

export const uploadCustomerProfile = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
}).single("profileImage");
