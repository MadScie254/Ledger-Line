import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "org-ledgerline-demo" },
    update: {},
    create: {
      id: "org-ledgerline-demo",
      name: "Akili Traders",
      legalName: "Akili Traders Limited",
      kraPin: "P052618349Z",
      industry: "Wholesale distribution",
      baseCurrency: "KES",
      planTier: "ENTERPRISE"
    }
  });

  await prisma.role.upsert({
    where: { orgId_name: { orgId: org.id, name: "Owner" } },
    update: {},
    create: {
      orgId: org.id,
      name: "Owner",
      isSystemRole: true,
      permissions: {
        ledger: ["view", "create", "edit", "approve"],
        reports: ["view", "export"],
        settings: ["view", "edit"]
      }
    }
  });

  const accountRows = [
    ["1000", "Equity Bank operating", "ASSET"],
    ["1010", "M-Pesa till", "ASSET"],
    ["1200", "Accounts receivable", "ASSET"],
    ["2000", "Accounts payable", "LIABILITY"],
    ["2150", "VAT payable", "LIABILITY"],
    ["3000", "Retained earnings", "EQUITY"],
    ["4000", "Product sales", "INCOME"],
    ["4100", "Service revenue", "INCOME"],
    ["5000", "Cost of goods sold", "COGS"],
    ["6100", "Payroll expense", "EXPENSE"],
    ["6200", "Rent expense", "EXPENSE"],
    ["6300", "Fuel and logistics", "EXPENSE"]
  ] as const;

  for (const [code, name, type] of accountRows) {
    await prisma.account.upsert({
      where: { orgId_code: { orgId: org.id, code } },
      update: {},
      create: {
        orgId: org.id,
        code,
        name,
        type,
        subtype: "Seed account",
        currency: "KES"
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
