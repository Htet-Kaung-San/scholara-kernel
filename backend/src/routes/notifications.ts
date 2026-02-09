import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { validate, paginationSchema } from "../middleware/validate.js";
import { asyncHandler } from "../types/index.js";

const router = Router();

// ─── Schemas ─────────────────────────────────

const notificationFilterSchema = paginationSchema.extend({
  unreadOnly: z.coerce.boolean().default(false),
  category: z
    .enum(["SCHOLARSHIP", "APPLICATION", "REMINDER", "ACHIEVEMENT", "SYSTEM"])
    .optional(),
});

const markReadSchema = z.object({
  ids: z.string().uuid().array().min(1),
});

// All notification routes require authentication
router.use(authenticate);

// ─── GET /api/notifications ─────────────────

router.get(
  "/",
  validate(notificationFilterSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit, unreadOnly, category } = req.query as unknown as z.infer<
      typeof notificationFilterSchema
    >;

    const where: Record<string, unknown> = { userId: req.userId };
    if (unreadOnly) where.isRead = false;
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.userId, isRead: false },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    });
  }),
);

// ─── PATCH /api/notifications/read ──────────

router.patch(
  "/read",
  validate(markReadSchema),
  asyncHandler(async (req, res) => {
    const { ids } = req.body;

    const { count } = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: req.userId, // ensure user owns these notifications
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: { markedRead: count },
    });
  }),
);

// ─── PATCH /api/notifications/read-all ──────

router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: { markedRead: count },
    });
  }),
);

// ─── DELETE /api/notifications/:id ──────────

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    await prisma.notification.delete({ where: { id: String(req.params.id) } });

    res.json({
      success: true,
      data: { message: "Notification deleted" },
    });
  }),
);

export default router;
