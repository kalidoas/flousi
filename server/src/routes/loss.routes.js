import { Router } from "express";
import { createLoss, deleteLoss, getLosses, updateLoss } from "../controllers/loss.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createLossSchema, listLossesSchema, lossIdSchema, updateLossSchema } from "../validators/loss.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listLossesSchema), asyncHandler(getLosses));
router.post("/", validate(createLossSchema), asyncHandler(createLoss));
router.put("/:id", validate(updateLossSchema), asyncHandler(updateLoss));
router.delete("/:id", validate(lossIdSchema), asyncHandler(deleteLoss));

export default router;

