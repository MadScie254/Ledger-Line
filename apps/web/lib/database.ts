import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createPrismaClient } from "@ledgerline/db";
import type { PrismaClient } from "@ledgerline/db";

interface LedgerlineWorkerEnv {
  HYPERDRIVE?: {
    connectionString: string;
  };
}

export async function withDatabase<T>(operation: (prisma: PrismaClient) => Promise<T>) {
  const prisma = createPrismaClient({ connectionString: getConnectionString() });

  try {
    return await operation(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

function getConnectionString() {
  try {
    const { env } = getCloudflareContext() as unknown as { env: LedgerlineWorkerEnv };

    if (env.HYPERDRIVE?.connectionString) {
      return env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Next's local Node server has no Worker request context. It uses DATABASE_URL instead.
  }

  const localConnectionString = process.env.DATABASE_URL;

  if (!localConnectionString) {
    throw new Error("Database is not configured. Set a Hyperdrive binding or DATABASE_URL.");
  }

  return localConnectionString;
}
