import { createPrismaClient } from "@ledgerline/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET, POST } from "../app/api/accounting/accounts/route";
import { PATCH } from "../app/api/accounting/accounts/[accountId]/route";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase("chart of accounts route handlers", () => {
  const orgId = `org-integration-${Date.now()}`;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousOrgId = process.env.LEDGERLINE_DEMO_ORG_ID;
  let prisma: ReturnType<typeof createPrismaClient>;

  beforeAll(async () => {
    process.env.DATABASE_URL = testDatabaseUrl!;
    process.env.LEDGERLINE_DEMO_ORG_ID = orgId;
    prisma = createPrismaClient({ connectionString: testDatabaseUrl! });
    await prisma.organization.create({ data: { id: orgId, name: "Integration Test Org" } });
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { orgId } });
    await prisma.account.deleteMany({ where: { orgId } });
    await prisma.organization.delete({ where: { id: orgId } });
    await prisma.$disconnect();
    process.env.DATABASE_URL = previousDatabaseUrl;
    process.env.LEDGERLINE_DEMO_ORG_ID = previousOrgId;
  });

  it("persists, reads, edits, and audits an account through the route handlers", async () => {
    const createResponse = await POST(new Request("http://ledgerline.test/api/accounting/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "7010", name: "Marketplace fees", type: "EXPENSE", subtype: "Selling cost", isActive: true })
    }));
    const created = await createResponse.json() as { account: { id: string; name: string } };

    expect(createResponse.status).toBe(201);
    expect(created.account.name).toBe("Marketplace fees");

    const listResponse = await GET();
    const list = await listResponse.json() as { accounts: Array<{ id: string }> };
    expect(list.accounts.some((account) => account.id === created.account.id)).toBe(true);

    const updateResponse = await PATCH(new Request(`http://ledgerline.test/api/accounting/accounts/${created.account.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "7010", name: "Marketplace and platform fees", type: "EXPENSE", subtype: "Selling cost", isActive: false })
    }), { params: Promise.resolve({ accountId: created.account.id }) });
    const updated = await updateResponse.json() as { account: { name: string; isActive: boolean } };

    expect(updateResponse.status).toBe(200);
    expect(updated.account).toMatchObject({ name: "Marketplace and platform fees", isActive: false });

    const auditEntries = await prisma.auditLogEntry.findMany({ where: { orgId, entityId: created.account.id }, orderBy: { createdAt: "asc" } });
    expect(auditEntries.map((entry) => entry.action)).toEqual(["account.created", "account.updated"]);
  });
});
