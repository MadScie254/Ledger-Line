import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export interface PrismaConnectionOptions {
  connectionString: string;
}

export function createPrismaClient({ connectionString }: PrismaConnectionOptions) {
  if (!connectionString) {
    throw new Error("A Postgres connection string is required to create the Ledgerline database client.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
