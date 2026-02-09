import type { Request, Response, NextFunction } from "express";

/**
 * Augment Express Request with authenticated user data.
 * This is populated by the auth middleware.
 */
declare global {
  namespace Express {
    interface Request {
      /** Supabase auth user id */
      userId?: string;
      /** User's email from Supabase auth */
      userEmail?: string;
      /** User's role from our profiles table */
      userRole?: string;
    }
  }
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Standard API response shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Pagination query parameters (after Zod parsing).
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Async route handler wrapper — catches errors and forwards to error middleware.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
