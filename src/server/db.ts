import "dotenv/config";
import { PrismaClient } from "~/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "~/env";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL ?? env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("❌ DATABASE_URL is missing!");
  }

  // Official Neon Recommended Setup
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
