import { Router } from "express";
import {
  achieveGoal,
  contributeGoal,
  createGoal,
  deleteGoal,
  getGoalImpact,
  getGoals,
  updateGoal
} from "../controllers/goal.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  contributeGoalSchema,
  createGoalSchema,
  goalIdSchema,
  listGoalsSchema,
  updateGoalSchema
} from "../validators/goal.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listGoalsSchema), asyncHandler(getGoals));
router.post("/", validate(createGoalSchema), asyncHandler(createGoal));
router.put("/:id", validate(updateGoalSchema), asyncHandler(updateGoal));
router.delete("/:id", validate(goalIdSchema), asyncHandler(deleteGoal));
router.post("/:id/contribute", validate(contributeGoalSchema), asyncHandler(contributeGoal));
router.get("/:id/impact", validate(goalIdSchema), asyncHandler(getGoalImpact));
router.put("/:id/achieve", validate(goalIdSchema), asyncHandler(achieveGoal));

export default router;

