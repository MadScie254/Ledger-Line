import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

interface ApprovalRequestRouteContext {
  params: Promise<{ billId: string }>;
}

export async function POST(request: Request, context: ApprovalRequestRouteContext) {
  try {
    const { billId } = await context.params;
    const payload = (await request.json()) as { approverEmail?: unknown; expiresInHours?: unknown };
    const approverEmail = typeof payload.approverEmail === "string" ? payload.approverEmail.trim() : "";

    if (!approverEmail) {
      return NextResponse.json({ error: "Approver email is required." }, { status: 422 });
    }

    const expiresInHours = typeof payload.expiresInHours === "number" && Number.isFinite(payload.expiresInHours) ? payload.expiresInHours : 24;
    const expiresAt = new Date(Date.now() + Math.max(1, expiresInHours) * 60 * 60 * 1000);

    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const userId = workspace.userId ?? "system";

    const result = await withDatabase((prisma) =>
      prisma.$transaction(async (tx) => {
        const bill = await tx.bill.findFirst({ where: { id: billId, orgId: workspace.orgId }, include: { vendor: { select: { displayName: true } } } });
        if (!bill) {
          throw new Error("Bill not found.");
        }

        const approveToken = randomBytes(24).toString("hex");
        const rejectToken = randomBytes(24).toString("hex");

        const approveHash = sha256(approveToken);
        const rejectHash = sha256(rejectToken);

        await tx.workspaceRecord.createMany({
          data: [
            {
              orgId: workspace.orgId,
              moduleKey: "bill-approval-token",
              title: bill.id,
              subtitle: approverEmail,
              status: "pending",
              metadata: {
                tokenHash: approveHash,
                action: "approve",
                expiresAt: expiresAt.toISOString()
              },
              createdBy: userId
            },
            {
              orgId: workspace.orgId,
              moduleKey: "bill-approval-token",
              title: bill.id,
              subtitle: approverEmail,
              status: "pending",
              metadata: {
                tokenHash: rejectHash,
                action: "reject",
                expiresAt: expiresAt.toISOString()
              },
              createdBy: userId
            }
          ]
        });

        await tx.auditLogEntry.create({
          data: {
            orgId: workspace.orgId,
            userId,
            action: "bill.approval-requested",
            entityType: "Bill",
            entityId: bill.id,
            diff: {
              approverEmail,
              expiresAt: expiresAt.toISOString()
            }
          }
        });

        const origin = new URL(request.url).origin;

        return {
          billNo: bill.billNo,
          vendor: bill.vendor.displayName,
          amount: bill.total.toString(),
          approverEmail,
          approveLink: `${origin}/api/expenses/bills/approval-action?token=${approveToken}`,
          rejectLink: `${origin}/api/expenses/bills/approval-action?token=${rejectToken}`,
          expiresAt: expiresAt.toISOString()
        };
      })
    );

    return NextResponse.json({ message: "Approval links generated.", emailPreview: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
