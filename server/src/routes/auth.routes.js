import { Router } from "express";
import passport from "passport";
import { env } from "../config/env.js";
import { deleteAccount, forgotPassword, login, logout, me, register, resetPassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validators.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));
router.delete("/account", requireAuth, asyncHandler(deleteAccount));

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.frontendUrl}/login?error=google`
  }),
  (req, res) => {
    const token = signToken(req.user.id);
    const redirectUrl = new URL(env.frontendUrl);
    redirectUrl.searchParams.set("token", token);
    res.redirect(redirectUrl.toString());
  }
);

export default router;
