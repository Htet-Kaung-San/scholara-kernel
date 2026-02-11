import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";
import { env } from "../config/env.js";

/**
 * Validate request body, query, or params against a Zod schema.
 *
 * Usage:
 *   router.post("/", validate(createScholarshipSchema, "body"), handler)
 *   router.get("/", validate(listQuerySchema, "query"), handler)
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.flatten();

      res.status(400).json({
        success: false,
        error: "Validation failed",
        details:
          env.NODE_ENV === "development"
            ? errors.fieldErrors
            : undefined,
      });
      return;
    }

    // Replace the source with parsed (and coerced) values
    // req.query may be read-only in newer Express, so use defineProperty
    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      (req as any)[source] = result.data;
    }
    next();
  };
}

// ─── Common Schemas ──────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
