import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../types/index.js";

const router = Router();

// ─── Schemas ─────────────────────────────────

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── POST /api/auth/signup ───────────────────

router.post(
  "/signup",
  validate(signUpSchema),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto-confirm for now; enable email verification later
      });

    if (authError) {
      res.status(400).json({
        success: false,
        error: authError.message,
      });
      return;
    }

    // Create matching profile in our database
    const profile = await prisma.profile.create({
      data: {
        authId: authData.user.id,
        email,
        firstName,
        lastName,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: profile.role,
        },
      },
    });
  }),
);

// ─── POST /api/auth/signin ──────────────────

router.post(
  "/signin",
  validate(signInSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data, error } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Fetch the profile
    const profile = await prisma.profile.findUnique({
      where: { authId: data.user.id },
    });

    res.json({
      success: true,
      data: {
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
        user: profile
          ? {
              id: profile.id,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              role: profile.role,
              onboardingCompleted: profile.onboardingCompleted,
            }
          : null,
      },
    });
  }),
);

// ─── POST /api/auth/signout ─────────────────

router.post(
  "/signout",
  authenticate,
  asyncHandler(async (_req, res) => {
    // The frontend should also clear its local session.
    // Server-side sign out is handled by expiring the session.
    res.json({
      success: true,
      data: { message: "Signed out successfully" },
    });
  }),
);

// ─── GET /api/auth/me ───────────────────────

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        error: "Profile not found",
      });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  }),
);

// ─── POST /api/auth/refresh ─────────────────

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
      return;
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  }),
);

export default router;
