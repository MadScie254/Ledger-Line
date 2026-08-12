import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 422 });
    }

    const tokenHash = sha256(token);
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const result = await withDatabase((prisma) =>
      prisma.$transaction(async (tx) => {
        const tokenRows = await tx.workspaceRecord.findMany({
          where: {
            orgId: workspace.orgId,
            moduleKey: "bill-approval-token",
            status: "pending"
          },
          orderBy: [{ createdAt: "desc" }]
        });

        const match = tokenRows.find((row) => {
          const metadata = row.metadata as Record<string, unknown> | null;
          return metadata?.tokenHash === tokenHash;
        });

        if (!match) {
          throw new Error("Approval token is invalid or already used.");
        }

        const metadata = match.metadata as Record<string, unknown>;
        const action = metadata.action === "reject" ? "reject" : "approve";
        const expiresAt = typeof metadata.expiresAt === "string" ? new Date(metadata.expiresAt) : null;

        if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
          throw new Error("Approval token has expired.");
        }

        const bill = await tx.bill.findFirst({ where: { id: match.title, orgId: workspace.orgId } });
        if (!bill) {
          throw new Error("Bill for this approval token was not found.");
        }

        await tx.workspaceRecord.update({
          where: { id: match.id },
          data: {
            status: "used",
            metadata: {
              ...metadata,
              usedAt: new Date().toISOString()
            }
          }
        });

        await tx.auditLogEntry.create({
          data: {
            orgId: workspace.orgId,
            userId: workspace.userId,
            action: action === "approve" ? "bill.approved-email" : "bill.rejected-email",
            entityType: "Bill",
            entityId: bill.id,
            diff: {
              tokenId: match.id,
              action
            }
          }
        });

        return {
          billId: bill.id,
          billNo: bill.billNo,
          action,
          message:
            action === "approve"
              ? `Bill ${bill.billNo} approved successfully.`
              : `Bill ${bill.billNo} rejected. Please review before payment.`
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Approval failed." }, { status: 400 });
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
