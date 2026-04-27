import { Router } from "express";
import { getBudget, updateBudget } from "../controllers/budget.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateBudgetSchema } from "../validators/budget.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getBudget));
router.put("/", validate(updateBudgetSchema), asyncHandler(updateBudget));

export default router;

