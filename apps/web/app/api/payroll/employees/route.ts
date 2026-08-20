import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const employees = await withDatabase((prisma) =>
      prisma.employee.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { name: "asc" },
      })
    );

    return NextResponse.json({
      employees: employees.map((e) => ({
        id: e.id,
        name: e.name,
        nationalId: e.nationalId,
        kraPin: e.kraPin,
        nssfNo: e.nssfNo,
        shifNo: e.shifNo,
        salaryStructure: e.salaryStructure,
        payFrequency: e.payFrequency,
        status: e.status,
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const { name, nationalId, kraPin, nssfNo, shifNo, baseSalaryMinor, payFrequency } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }

    const employee = await withDatabase((prisma) =>
      prisma.employee.create({
        data: {
          orgId: workspace.orgId,
          name,
          nationalId: nationalId || null,
          kraPin: kraPin || null,
          nssfNo: nssfNo || null,
          shifNo: shifNo || null,
          payFrequency: payFrequency ?? "MONTHLY",
          salaryStructure: { baseSalaryMinor: Number(baseSalaryMinor) || 0 },
        },
      })
    );

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    return NextResponse.json({ error: "Failed to create employee." }, { status: 500 });
  }
}
