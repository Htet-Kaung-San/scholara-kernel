import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin, requireSuperAdmin } from "../middleware/admin.js";
import {
  validate,
  paginationSchema,
  uuidParamSchema,
} from "../middleware/validate.js";
import { asyncHandler } from "../types/index.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── Schemas ─────────────────────────────────

const createScholarshipSchema = z.object({
  title: z.string().min(1).max(300),
  provider: z.string().min(1).max(200),
  country: z.string().min(1).max(200),
  imageUrl: z.string().max(20000).nullable().optional(),
  level: z.string().min(1).max(100),
  status: z.enum(["OPEN", "CLOSED", "UPCOMING", "DRAFT"]).optional(),
  duration: z.string().nullable().optional(),
  tuitionWaiver: z.string().nullable().optional(),
  monthlyStipend: z.string().nullable().optional(),
  applicationFee: z.string().nullable().optional(),
  flightTicket: z.string().nullable().optional(),
  maxAge: z.coerce.number().int().optional().nullable(),
  openDate: z.coerce.date().nullable().optional(),
  applicationDeadLine: z.coerce.date().nullable().optional(),

  // Deprecated/Removed from form
  description: z.string().optional(),
  value: z.string().optional(),
  deadline: z.coerce.date().nullable().optional(),

  fieldOfStudy: z.string().min(1),
  type: z.enum(["GOVERNMENT", "UNIVERSITY", "PRIVATE", "NGO"]).default("GOVERNMENT"),
  eligibility: z.any().optional(),
  benefits: z.any().optional(),
  requirements: z.any().optional(),
  timeline: z.any().optional(),
  featured: z.boolean().default(false),
});

const updateScholarshipSchema = createScholarshipSchema.partial();

const userFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

const applicationReviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  score: z.number().int().min(0).max(100).nullable().optional(),
  adminNotes: z.string().max(5000).nullable().optional(),
});

// ════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      totalScholarships,
      totalApplications,
      applicationsByStatus,
      recentApplications,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.scholarship.count(),
      prisma.application.count(),
      prisma.application.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          scholarship: { select: { title: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalScholarships,
          totalApplications,
          applicationsByStatus: Object.fromEntries(
            applicationsByStatus.map((g) => [g.status, g._count]),
          ),
        },
        recentApplications,
      },
    });
  }),
);

// ════════════════════════════════════════════════
// SCHOLARSHIP MANAGEMENT (CRUD)
// ════════════════════════════════════════════════

router.post(
  "/scholarships",
  validate(createScholarshipSchema),
  asyncHandler(async (req, res) => {
    const scholarship = await prisma.scholarship.create({
      data: {
        ...req.body,
        createdById: req.userId,
      },
    });

    res.status(201).json({ success: true, data: scholarship });
  }),
);

router.patch(
  "/scholarships/:id",
  validate(uuidParamSchema, "params"),
  validate(updateScholarshipSchema),
  asyncHandler(async (req, res) => {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!scholarship) {
      res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
      return;
    }

    const updated = await prisma.scholarship.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });

    res.json({ success: true, data: updated });
  }),
);

router.delete(
  "/scholarships/:id",
  validate(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: String(req.params.id) },
      include: { _count: { select: { applications: true } } },
    });

    if (!scholarship) {
      res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
      return;
    }

    if (scholarship._count.applications > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete: ${scholarship._count.applications} applications exist. Archive it instead.`,
      });
      return;
    }

    await prisma.scholarship.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, data: { message: "Scholarship deleted" } });
  }),
);

// ════════════════════════════════════════════════
// USER MANAGEMENT
// ════════════════════════════════════════════════

router.get(
  "/users",
  validate(userFilterSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit, search, role, status } = req.query as unknown as z.infer<
      typeof userFilterSchema
    >;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          onboardingCompleted: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

// Change user role (SUPER_ADMIN only)
router.patch(
  "/users/:id/role",
  requireSuperAdmin,
  validate(uuidParamSchema, "params"),
  validate(z.object({ role: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]) })),
  asyncHandler(async (req, res) => {
    const user = await prisma.profile.update({
      where: { id: String(req.params.id) },
      data: { role: req.body.role },
      select: { id: true, email: true, role: true },
    });

    res.json({ success: true, data: user });
  }),
);

// Suspend/activate user
router.patch(
  "/users/:id/status",
  validate(uuidParamSchema, "params"),
  validate(z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) })),
  asyncHandler(async (req, res) => {
    const user = await prisma.profile.update({
      where: { id: String(req.params.id) },
      data: { status: req.body.status },
      select: { id: true, email: true, status: true },
    });

    res.json({ success: true, data: user });
  }),
);

// ════════════════════════════════════════════════
// APPLICATION REVIEW
// ════════════════════════════════════════════════

router.get(
  "/applications",
  validate(
    paginationSchema.extend({
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
      scholarshipId: z.string().uuid().optional(),
    }),
    "query",
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, status, scholarshipId } = req.query as unknown as {
      page: number;
      limit: number;
      status?: string;
      scholarshipId?: string;
    };

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (scholarshipId) where.scholarshipId = scholarshipId;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          scholarship: {
            select: { id: true, title: true, provider: true },
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

router.patch(
  "/applications/:id/review",
  validate(uuidParamSchema, "params"),
  validate(applicationReviewSchema),
  asyncHandler(async (req, res) => {
    const application = await prisma.application.findUnique({
      where: { id: String(req.params.id) },
      include: { scholarship: { select: { title: true } } },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    const updated = await prisma.application.update({
      where: { id: String(req.params.id) },
      data: {
        status: req.body.status,
        score: req.body.score ?? undefined,
        adminNotes: req.body.adminNotes ?? undefined,
      },
    });

    // Notify the applicant
    const notificationType =
      req.body.status === "APPROVED" ? "SUCCESS" : "INFO";
    const statusText =
      req.body.status === "APPROVED"
        ? "approved"
        : req.body.status === "REJECTED"
          ? "not selected"
          : "updated";

    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: notificationType,
        category: "APPLICATION",
        title: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        message: `Your application for ${application.scholarship.title} has been ${statusText}.`,
        metadata: {
          applicationId: application.id,
          newStatus: req.body.status,
        },
      },
    });

    res.json({ success: true, data: updated });
  }),
);

export default router;
