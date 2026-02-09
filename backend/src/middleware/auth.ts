import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { prisma } from "../config/prisma.js";

/**
 * Authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it against Supabase Auth, and attaches user info to the request.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Missing or malformed Authorization header",
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    // Verify the JWT with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
      return;
    }

    // Look up the user's profile to get their role
    const profile = await prisma.profile.findUnique({
      where: { authId: user.id },
      select: { id: true, role: true, status: true },
    });

    if (profile?.status === "SUSPENDED") {
      res.status(403).json({
        success: false,
        error: "Account is suspended",
      });
      return;
    }

    // Attach user data to the request
    req.userId = profile?.id ?? user.id;
    req.userEmail = user.email;
    req.userRole = profile?.role ?? "STUDENT";

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional auth — does not reject unauthenticated requests,
 * but populates user data if a valid token is present.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { authId: user.id },
        select: { id: true, role: true },
      });

      req.userId = profile?.id ?? user.id;
      req.userEmail = user.email;
      req.userRole = profile?.role ?? "STUDENT";
    }
  } catch {
    // Silently ignore auth errors in optional mode
  }

  next();
}
