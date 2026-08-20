import { NextResponse } from "next/server";
import { initiateSTKPush } from "@/lib/mpesa";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const { phoneNumber, amount, accountReference, transactionDesc } = body;

    if (!phoneNumber || !amount || !accountReference) {
      return NextResponse.json(
        { error: "Missing required fields: phoneNumber, amount, accountReference" },
        { status: 400 }
      );
    }

    // In a real environment, you'd save the pending transaction to DB first
    // before calling Daraja, to track the MerchantRequestID.
    
    // Check if M-Pesa is configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_SHORTCODE) {
       // Mock response for local dev if keys aren't present
       console.warn("M-Pesa keys missing. Mocking STK Push response.");
       return NextResponse.json({
         MerchantRequestID: "MOCK-" + Date.now(),
         CheckoutRequestID: "MOCK-CHK-" + Date.now(),
         ResponseCode: "0",
         ResponseDescription: "Success. Request accepted for processing (MOCKED)",
         CustomerMessage: "Success. Request accepted for processing (MOCKED)",
       });
    }

    const mpesaRes = await initiateSTKPush({
      phoneNumber,
      amount: Number(amount),
      accountReference,
      transactionDesc,
    });

    return NextResponse.json(mpesaRes);
  } catch (error) {
    console.error("STK Push error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
