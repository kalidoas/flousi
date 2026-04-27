export const notFoundHandler = (_req, _res, next) => {
  next({ statusCode: 404, message: "Route not found" });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  const payload = {
    message: error.message || "Internal Server Error"
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    payload.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
};

