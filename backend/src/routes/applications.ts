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

const createApplicationSchema = z.object({
  scholarshipId: z.string().uuid(),
});

const updateApplicationSchema = z.object({
  essays: z
    .array(z.object({ title: z.string(), content: z.string() }))
    .optional(),
  status: z
    .enum(["DRAFT", "PENDING_DOCUMENTS", "UNDER_REVIEW", "WITHDRAWN"])
    .optional(),
});

const applicationFilterSchema = paginationSchema.extend({
  status: z
    .enum([
      "DRAFT",
      "PENDING_DOCUMENTS",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional(),
});

// ─── GET /api/applications ──────────────────

router.get(
  "/",
  authenticate,
  validate(applicationFilterSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query as unknown as z.infer<
      typeof applicationFilterSchema
    >;

    const where: Record<string, unknown> = { userId: req.userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          scholarship: {
            select: {
              id: true,
              title: true,
              provider: true,
              country: true,
              deadline: true,
              value: true,
              imageUrl: true,
            },
          },
          _count: { select: { documents: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: applications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

// ─── POST /api/applications ─────────────────

router.post(
  "/",
  authenticate,
  validate(createApplicationSchema),
  asyncHandler(async (req, res) => {
    const { scholarshipId } = req.body;

    // Check scholarship exists and is open
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
      return;
    }

    if (scholarship.status !== "OPEN") {
      res.status(400).json({
        success: false,
        error: "This scholarship is not currently accepting applications",
      });
      return;
    }

    // Check for deadline
    if (scholarship.deadline && scholarship.deadline < new Date()) {
      res.status(400).json({
        success: false,
        error: "Application deadline has passed",
      });
      return;
    }

    // Check if user already applied
    const existing = await prisma.application.findUnique({
      where: {
        userId_scholarshipId: {
          userId: req.userId!,
          scholarshipId,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: "You have already applied to this scholarship",
      });
      return;
    }

    const application = await prisma.application.create({
      data: {
        userId: req.userId!,
        scholarshipId,
      },
      include: {
        scholarship: {
          select: { title: true, provider: true },
        },
      },
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: req.userId!,
        type: "INFO",
        category: "APPLICATION",
        title: "Application Started",
        message: `You started an application for ${application.scholarship.title}`,
        metadata: { applicationId: application.id, scholarshipId },
      },
    });

    res.status(201).json({ success: true, data: application });
  }),
);

// ─── GET /api/applications/:id ──────────────

router.get(
  "/:id",
  authenticate,
  validate(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const application = await prisma.application.findFirst({
      where: {
        id: String(req.params.id),
        userId: req.userId,
      },
      include: {
        scholarship: true,
        documents: true,
      },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    res.json({ success: true, data: application });
  }),
);

// ─── PATCH /api/applications/:id ────────────

router.patch(
  "/:id",
  authenticate,
  validate(uuidParamSchema, "params"),
  validate(updateApplicationSchema),
  asyncHandler(async (req, res) => {
    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    // Can't edit submitted/approved/rejected applications
    if (["APPROVED", "REJECTED"].includes(existing.status)) {
      res.status(400).json({
        success: false,
        error: "Cannot modify a finalized application",
      });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (req.body.essays !== undefined) updateData.essays = req.body.essays;
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
      // If submitting, record the timestamp
      if (
        req.body.status === "UNDER_REVIEW" &&
        existing.status !== "UNDER_REVIEW"
      ) {
        updateData.submittedAt = new Date();
      }
    }

    const application = await prisma.application.update({
      where: { id: String(req.params.id) },
      data: updateData,
      include: { scholarship: { select: { title: true } } },
    });

    // Notify on submission
    if (req.body.status === "UNDER_REVIEW") {
      await prisma.notification.create({
        data: {
          userId: req.userId!,
          type: "SUCCESS",
          category: "APPLICATION",
          title: "Application Submitted",
          message: `Your application for ${application.scholarship.title} has been submitted for review.`,
          metadata: { applicationId: application.id },
        },
      });
    }

    res.json({ success: true, data: application });
  }),
);

// ─── DELETE /api/applications/:id ───────────

router.delete(
  "/:id",
  authenticate,
  validate(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.application.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    if (existing.status === "UNDER_REVIEW") {
      res.status(400).json({
        success: false,
        error: "Cannot delete an application under review. Withdraw it first.",
      });
      return;
    }

    await prisma.application.delete({ where: { id: String(req.params.id) } });

    res.json({
      success: true,
      data: { message: "Application deleted" },
    });
  }),
);

export default router;
