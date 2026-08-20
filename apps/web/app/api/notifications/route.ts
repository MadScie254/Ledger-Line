import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const workspace = await requireWorkspace(request);
  if (isWorkspaceError(workspace)) return workspace;

  return await withDatabase(async (prisma) => {
    const now = new Date();

    // Overdue invoices (dueDate < now, status not PAID)
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        orgId: workspace.orgId,
        dueDate: { lt: now },
        status: { notIn: ["PAID"] },
      },
      include: { customer: { select: { displayName: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    });

    // Low-stock items (qtyOnHand < 5)
    const lowStockItems = await prisma.product.findMany({
      where: {
        orgId: workspace.orgId,
        qtyOnHand: { lt: 5 },
      },
      orderBy: { qtyOnHand: "asc" },
      take: 10,
    });

    // Upcoming bill due dates (next 7 days, status not PAID)
    const sevenDays = new Date(now);
    sevenDays.setDate(sevenDays.getDate() + 7);
    const upcomingBills = await prisma.bill.findMany({
      where: {
        orgId: workspace.orgId,
        dueDate: { gte: now, lte: sevenDays },
        status: { notIn: ["PAID"] },
      },
      include: { vendor: { select: { displayName: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    });

    const notifications: Array<{
      id: string;
      type: "overdue_invoice" | "low_stock" | "bill_due";
      title: string;
      body: string;
      severity: "error" | "warning" | "info";
      createdAt: string;
    }> = [];

    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000);
      notifications.push({
        id: `inv-${inv.id}`,
        type: "overdue_invoice",
        title: `Invoice ${inv.invoiceNo} overdue`,
        body: `${inv.customer.displayName} — ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue. Balance: ${inv.balanceDue.toFixed(2)}.`,
        severity: daysOverdue > 30 ? "error" : "warning",
        createdAt: inv.dueDate.toISOString(),
      });
    }

    for (const item of lowStockItems) {
      notifications.push({
        id: `stock-${item.id}`,
        type: "low_stock",
        title: `Low stock: ${item.name}`,
        body: `Only ${item.qtyOnHand.toFixed(0)} unit${Number(item.qtyOnHand) !== 1 ? "s" : ""} remaining.${item.sku ? ` SKU: ${item.sku}` : ""}`,
        severity: Number(item.qtyOnHand) === 0 ? "error" : "warning",
        createdAt: now.toISOString(),
      });
    }

    for (const bill of upcomingBills) {
      const daysUntilDue = Math.floor((bill.dueDate.getTime() - now.getTime()) / 86400000);
      notifications.push({
        id: `bill-${bill.id}`,
        type: "bill_due",
        title: `Bill due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`,
        body: `${bill.vendor.displayName} — ${bill.billNo}. Amount: ${bill.total.toFixed(2)}.`,
        severity: "info",
        createdAt: bill.dueDate.toISOString(),
      });
    }

    // Sort by severity then date
    const severityOrder = { error: 0, warning: 1, info: 2 };
    notifications.sort((a, b) => {
      const sev = severityOrder[a.severity] - severityOrder[b.severity];
      if (sev !== 0) return sev;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json({ notifications, count: notifications.length });
  });
}
