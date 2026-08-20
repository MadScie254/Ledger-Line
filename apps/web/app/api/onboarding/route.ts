import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withDatabase } from "@/lib/database";

import { adminAuthClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.app_metadata?.orgId) {
      return NextResponse.json(
        { error: "User already belongs to an organization." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orgName, legalName, industry, kraPin, currency } = body;

    if (!orgName || typeof orgName !== "string") {
      return NextResponse.json(
        { error: "Organization name is required." },
        { status: 400 }
      );
    }

    const orgId = await withDatabase(async (prisma) => {
      return prisma.$transaction(async (tx) => {
        // 1. Create Organization
        const org = await tx.organization.create({
          data: {
            name: orgName,
            legalName: legalName || null,
            industry: industry || null,
            kraPin: kraPin || null,
            baseCurrency: currency || "KES",
            planTier: "FREE",
          },
        });

        // 2. Create User record in our DB
        await tx.user.upsert({
          where: { email: user.email! },
          update: { orgId: org.id },
          create: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || "User",
            orgId: org.id,
          },
        });

        // 3. Create Default Roles
        const ownerRole = await tx.role.create({
          data: {
            orgId: org.id,
            name: "Owner",
            isSystemRole: true,
            permissions: { all: true },
          },
        });

        await tx.role.createMany({
          data: [
            {
              orgId: org.id,
              name: "Bookkeeper",
              isSystemRole: true,
              permissions: {
                accounting: { view: true, create: true, edit: true, delete: true },
                banking: { view: true, create: true, edit: true, delete: true },
                reports: { view: true, create: true, edit: true, delete: true },
              },
            },
            {
              orgId: org.id,
              name: "Viewer",
              isSystemRole: true,
              permissions: {
                sales: { view: true, create: false, edit: false, delete: false },
                expenses: { view: true, create: false, edit: false, delete: false },
                banking: { view: true, create: false, edit: false, delete: false },
                accounting: { view: true, create: false, edit: false, delete: false },
                payroll: { view: true, create: false, edit: false, delete: false },
                tax: { view: true, create: false, edit: false, delete: false },
                inventory: { view: true, create: false, edit: false, delete: false },
                reports: { view: true, create: false, edit: false, delete: false },
                team: { view: true, create: false, edit: false, delete: false },
                settings: { view: true, create: false, edit: false, delete: false },
              },
            },
          ],
        });

        // 4. Create Membership
        await tx.orgMembership.create({
          data: {
            userId: user.id,
            orgId: org.id,
            roleId: ownerRole.id,
            status: "ACTIVE",
          },
        });

        // 5. Create Default Accounts
        await tx.account.createMany({
          data: [
            { orgId: org.id, code: "1000", name: "Cash on Hand", type: "ASSET", currency: org.baseCurrency },
            { orgId: org.id, code: "1200", name: "Accounts Receivable", type: "ASSET", currency: org.baseCurrency },
            { orgId: org.id, code: "2000", name: "Accounts Payable", type: "LIABILITY", currency: org.baseCurrency },
            { orgId: org.id, code: "3000", name: "Retained Earnings", type: "EQUITY", currency: org.baseCurrency },
            { orgId: org.id, code: "4000", name: "Sales Revenue", type: "INCOME", currency: org.baseCurrency },
            { orgId: org.id, code: "5000", name: "Cost of Goods Sold", type: "COGS", currency: org.baseCurrency },
            { orgId: org.id, code: "6300", name: "General Expenses", type: "EXPENSE", currency: org.baseCurrency },
          ],
        });

        return org.id;
      });
    });

    // Update user app_metadata in Supabase using the admin client
    const { error: updateError } = await adminAuthClient.auth.admin.updateUserById(user.id, {
      app_metadata: { orgId },
    });

    if (updateError) {
      console.error("Failed to update user metadata with orgId:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase.auth.refreshSession();

    return NextResponse.json({ success: true, orgId });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create organization." },
      { status: 500 }
    );
  }
}
