import multer from "multer";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);

  res.status(404);

  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;

  /*
    Operator precedence safe version
  */

  statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  let message = err.message || "Internal Server Error";

  /* Multer errors */

  if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image is too large";
    }
  }

  /* Mongo duplicate key */

  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue || {})[0];

    message = `${field || "Value"} already exists`;
  }

  /* Mongoose validation */

  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  /* Invalid mongo id */

  if (err.name === "CastError") {
    statusCode = 400;

    message = "Invalid resource ID";
  }

  res.status(statusCode).json({
    success: false,

    message,

    errors: err.errors || [],

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
