import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const workspace = await requireWorkspace(request);
  if (isWorkspaceError(workspace)) return workspace;

  return await withDatabase(async (prisma) => {
    const [invoices, customers, vendors] = await Promise.all([
      prisma.invoice.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { issueDate: "desc" },
        take: 5,
        select: { id: true, invoiceNo: true, customer: { select: { displayName: true } } },
      }),
      prisma.customer.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { id: "desc" },
        take: 5,
        select: { id: true, displayName: true },
      }),
      prisma.vendor.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { id: "desc" },
        take: 5,
        select: { id: true, displayName: true },
      }),
    ]);

    const recent = [
      ...invoices.map((inv) => ({
        id: inv.id,
        type: "invoice",
        title: `Invoice ${inv.invoiceNo}`,
        subtitle: inv.customer.displayName,
        href: `/sales/invoices?id=${inv.id}`,
      })),
      ...customers.map((c) => ({
        id: c.id,
        type: "customer",
        title: c.displayName,
        subtitle: "Customer",
        href: `/sales/customers?id=${c.id}`,
      })),
      ...vendors.map((v) => ({
        id: v.id,
        type: "vendor",
        title: v.displayName,
        subtitle: "Vendor",
        href: `/expenses/vendors?id=${v.id}`,
      })),
    ];

    return NextResponse.json({ recent });
  });
}
