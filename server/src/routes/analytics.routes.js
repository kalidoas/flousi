import { Router } from "express";
import { getAnalyticsByCategory, getAnalyticsByDay } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyticsQuerySchema } from "../validators/analytics.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/by-category", validate(analyticsQuerySchema), asyncHandler(getAnalyticsByCategory));
router.get("/by-day", validate(analyticsQuerySchema), asyncHandler(getAnalyticsByDay));

export default router;

