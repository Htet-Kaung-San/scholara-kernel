import type { Request, Response, NextFunction } from "express";

/**
 * Require ADMIN or SUPER_ADMIN role.
 * Must be used after the `authenticate` middleware.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.userRole !== "ADMIN" && req.userRole !== "SUPER_ADMIN") {
    res.status(403).json({
      success: false,
      error: "Admin access required",
    });
    return;
  }
  next();
}

/**
 * Require SUPER_ADMIN role specifically.
 * Must be used after the `authenticate` middleware.
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.userRole !== "SUPER_ADMIN") {
    res.status(403).json({
      success: false,
      error: "Super admin access required",
    });
    return;
  }
  next();
}
