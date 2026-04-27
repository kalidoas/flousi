import { Router } from "express";
import { createIncome, deleteIncome, getIncome } from "../controllers/income.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createIncomeSchema, deleteIncomeSchema, listIncomeSchema } from "../validators/income.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listIncomeSchema), asyncHandler(getIncome));
router.post("/", validate(createIncomeSchema), asyncHandler(createIncome));
router.delete("/:id", validate(deleteIncomeSchema), asyncHandler(deleteIncome));

export default router;

