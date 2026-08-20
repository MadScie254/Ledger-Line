import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const estimates = await withDatabase((prisma) =>
      prisma.estimate.findMany({
        where: { orgId: workspace.orgId },
        include: {
          customer: { select: { id: true, displayName: true } },
          lines: true,
        },
        orderBy: { issueDate: "desc" },
        take: 50,
      })
    );

    return NextResponse.json({
      estimates: estimates.map((e) => ({
        id: e.id,
        estimateNo: e.estimateNo,
        issueDate: e.issueDate,
        expiryDate: e.expiryDate,
        status: e.status,
        currency: e.currency,
        subtotal: e.subtotal,
        taxTotal: e.taxTotal,
        total: e.total,
        customer: e.customer ? { id: e.customer.id, name: e.customer.displayName } : null,
        lines: e.lines.map((l) => ({
          description: l.description,
          qty: l.qty,
          unitPrice: l.unitPrice,
          amount: l.amount,
        })),
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch estimates:", error);
    return NextResponse.json({ error: "Failed to fetch estimates." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const { customerId, estimateNo, issueDate, expiryDate, message, footer, lines = [] } = body;

    if (!customerId || !estimateNo || !issueDate) {
      return NextResponse.json({ error: "customerId, estimateNo, and issueDate are required." }, { status: 400 });
    }

    const subtotal = lines.reduce((sum: number, l: any) => sum + Number(l.qty || 1) * Number(l.unitPrice || 0), 0);

    const estimate = await withDatabase((prisma) =>
      prisma.estimate.create({
        data: {
          orgId: workspace.orgId,
          customerId,
          estimateNo,
          issueDate: new Date(issueDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          message: message || null,
          footer: footer || null,
          subtotal,
          taxTotal: 0,
          total: subtotal,
          lines: {
            create: lines.map((l: any) => ({
              description: l.description,
              qty: Number(l.qty || 1),
              unitPrice: Number(l.unitPrice || 0),
              amount: Number(l.qty || 1) * Number(l.unitPrice || 0),
            })),
          },
        },
        include: { customer: true, lines: true },
      })
    );

    return NextResponse.json({ estimate }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create estimate:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "An estimate with this number already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create estimate." }, { status: 500 });
  }
}
