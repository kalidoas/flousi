import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

