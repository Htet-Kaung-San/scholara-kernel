import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL as string,
    log: env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  } as any);

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
