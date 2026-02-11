import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";
import {
  validate,
  paginationSchema,
  uuidParamSchema,
} from "../middleware/validate.js";
import { asyncHandler } from "../types/index.js";

const router = Router();

// ─── Schemas ─────────────────────────────────

const scholarshipFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["OPEN", "CLOSED", "UPCOMING", "DRAFT"]).optional(),
  country: z.string().optional(),
  level: z.string().optional(),
  type: z.enum(["GOVERNMENT", "UNIVERSITY", "PRIVATE", "NGO"]).optional(),
  fieldOfStudy: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["applicationDeadLine", "deadline", "createdAt", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ─── GET /api/scholarships ──────────────────

router.get(
  "/",
  optionalAuth,
  validate(scholarshipFilterSchema, "query"),
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      search,
      status,
      country,
      level,
      type,
      fieldOfStudy,
      featured,
      sortBy,
      sortOrder,
    } = req.query as unknown as z.infer<typeof scholarshipFilterSchema>;

    // Build dynamic where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { provider: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (level) where.level = { contains: level, mode: "insensitive" };
    if (type) where.type = type;
    if (fieldOfStudy) {
      where.fieldOfStudy = { contains: fieldOfStudy, mode: "insensitive" };
    }
    if (featured !== undefined) where.featured = featured;

    // Don't show DRAFT scholarships to non-admin users
    if (req.userRole !== "ADMIN" && req.userRole !== "SUPER_ADMIN") {
      where.status = where.status ?? { not: "DRAFT" };
    }

    const skip = (page - 1) * limit;

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { applications: true } },
        },
        skip,
        take: limit,
      }),
      prisma.scholarship.count({ where }),
    ]);

    res.json({
      success: true,
      data: scholarships,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }),
);

// ─── GET /api/scholarships/featured ─────────
// NOTE: Static routes must come before parameterized routes (/:id)

router.get(
  "/featured",
  asyncHandler(async (_req, res) => {
    const scholarships = await prisma.scholarship.findMany({
      where: { featured: true, status: "OPEN" },
      orderBy: { applicationDeadLine: "asc" },
      take: 6,
    });

    res.json({ success: true, data: scholarships });
  }),
);

// ─── GET /api/scholarships/:id ──────────────

router.get(
  "/:id",
  optionalAuth,
  validate(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: String(req.params.id) },
      include: {
        _count: { select: { applications: true } },
      },
    });

    if (!scholarship) {
      res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
      return;
    }

    // Don't show DRAFT to non-admins
    if (
      scholarship.status === "DRAFT" &&
      req.userRole !== "ADMIN" &&
      req.userRole !== "SUPER_ADMIN"
    ) {
      res.status(404).json({
        success: false,
        error: "Scholarship not found",
      });
      return;
    }

    res.json({ success: true, data: scholarship });
  }),
);

export default router;
