import multer from "multer";
import path from "path";
import fs from "fs";

import { ApiError } from "../utils/ApiError.js";

const uploadDirectory = path.resolve("uploads/banners");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `banner-${Date.now()}-${Math.floor(
      Math.random() * 1000000,
    )}${extension}`;

    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
  }

  cb(null, true);
};

export const uploadBannerImage = multer({
  storage,

  limits: {
    fileSize: 8 * 1024 * 1024,
  },

  fileFilter,
}).single("image");
