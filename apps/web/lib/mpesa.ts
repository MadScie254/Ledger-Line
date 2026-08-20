/**
 * M-Pesa Daraja API Client
 * Standard OAuth and STK push functions for Safaricom Daraja API.
 * Uses pure fetch.
 */

const MPESA_ENV = process.env.MPESA_ENV || "sandbox"; // "sandbox" or "live"
const BASE_URL =
  MPESA_ENV === "live"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const PASSKEY = process.env.MPESA_PASSKEY || "";
const SHORTCODE = process.env.MPESA_SHORTCODE || "";

/**
 * Generate an OAuth access token.
 */
export async function getMpesaToken(): Promise<string> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error("Missing M-Pesa credentials");
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  
  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      // Do not cache the token at the fetch level; handle cache in memory or let Daraja TTL it.
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to get M-Pesa token: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Initiate an STK Push (Lipa Na M-Pesa Online).
 */
export async function initiateSTKPush({
  phoneNumber,
  amount,
  accountReference,
  transactionDesc = "LedgerLine Payment",
  callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ledgerline.app"}/api/mpesa/callback`,
}: {
  phoneNumber: string; // 2547XXXXXXXX
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
}) {
  const token = await getMpesaToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3); // YYYYMMDDHHmmss
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString(
    "base64"
  );

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline", // or CustomerBuyGoodsOnline
    Amount: Math.ceil(amount),
    PartyA: phoneNumber,
    PartyB: SHORTCODE,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.text();
    throw new Error(`STK Push failed: ${errData}`);
  }

  return res.json();
}
