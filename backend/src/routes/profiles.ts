import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import {
  validate,
  paginationSchema,
  uuidParamSchema,
} from "../middleware/validate.js";
import { asyncHandler } from "../types/index.js";

const router = Router();

// ─── Schemas ─────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  nationality: z.string().nullable().optional(),
  residingCountry: z.string().nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  currentInstitution: z.string().nullable().optional(),
  educationLevel: z
    .enum(["HIGH_SCHOOL", "BACHELORS", "MASTERS", "PHD"])
    .nullable()
    .optional(),
  interests: z.string().array().optional(),
  personalStatement: z.string().max(10000).nullable().optional(),
  studyPlan: z.string().max(10000).nullable().optional(),
  achievements: z.string().array().optional(),
  highlights: z.string().array().optional(),
  organizations: z.string().array().optional(),
});

const onboardingSchema = z.object({
  nationality: z.string().min(1),
  residingCountry: z.string().min(1),
  dateOfBirth: z.coerce.date().optional(),
  currentInstitution: z.string().optional(),
  educationLevel: z.enum(["HIGH_SCHOOL", "BACHELORS", "MASTERS", "PHD"]),
  interests: z.string().array().min(1, "Select at least one interest"),
});

// ─── GET /api/profiles/me ───────────────────
// Alias for convenience (same as /api/auth/me)

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
      include: {
        _count: {
          select: {
            applications: true,
            documents: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: "Profile not found" });
      return;
    }

    res.json({ success: true, data: profile });
  }),
);

// ─── PATCH /api/profiles/me ─────────────────

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const profile = await prisma.profile.update({
      where: { id: req.userId },
      data: req.body,
    });

    res.json({ success: true, data: profile });
  }),
);

// ─── POST /api/profiles/onboarding ──────────

router.patch(
  "/onboarding",
  authenticate,
  validate(onboardingSchema),
  asyncHandler(async (req, res) => {
    const profile = await prisma.profile.update({
      where: { id: req.userId },
      data: {
        ...req.body,
        onboardingCompleted: true,
      },
    });

    res.json({ success: true, data: profile });
  }),
);

// ─── GET /api/profiles/:id (public view) ────

router.get(
  "/:id",
  validate(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const profile = await prisma.profile.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        currentInstitution: true,
        educationLevel: true,
        interests: true,
        achievements: true,
        highlights: true,
        organizations: true,
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: "Profile not found" });
      return;
    }

    res.json({ success: true, data: profile });
  }),
);

export default router;
