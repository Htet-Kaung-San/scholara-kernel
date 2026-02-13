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
        email_confirm: true,
        user_metadata: { firstName, lastName },
      });

    if (authError) {
      console.error("❌ Supabase Auth Error:", authError);
      res.status(400).json({
        success: false,
        error: authError.message,
      });
      return;
    }

    // Create or get matching profile in our database
    // We use upsert to be robust:
    // 1. If trigger works: it finds the existing profile (and does nothing).
    // 2. If trigger failed/missing: it creates the profile here.
    const profile = await prisma.profile.upsert({
      where: { authId: authData.user.id },
      update: {
        // Option specific fields if needed, but usually we just want to return the user
        // We can ensure names are up to date
        firstName,
        lastName,
      },
      create: {
        authId: authData.user.id,
        email,
        firstName,
        lastName,
      },
    });

    // Ensure each user has one welcome notification after signup.
    const existingWelcome = await prisma.notification.findFirst({
      where: {
        userId: profile.id,
        category: "SYSTEM",
        title: "Welcome to ScholarAid",
      },
      select: { id: true },
    });

    if (!existingWelcome) {
      await prisma.notification.create({
        data: {
          userId: profile.id,
          type: "SUCCESS",
          category: "SYSTEM",
          title: "Welcome to ScholarAid",
          message:
            "Your account is ready. Complete your profile and start exploring scholarships curated for your goals.",
          metadata: { kind: "welcome" },
        },
      });
    }

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
