import { Router } from "express";
import { forgotPassword, login, logout, me, register, resetPassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

