"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { Button, DoubleRule, Field, Input } from "@ledgerline/ui";
import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

interface ApprovalPreview {
  billNo: string;
  approverEmail: string;
  approveLink: string;
  rejectLink: string;
  expiresAt: string;
}

export function BillsWorkspace() {
  const [billId, setBillId] = useState("");
  const [approverEmail, setApproverEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [preview, setPreview] = useState<ApprovalPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SimpleEntityWorkspace
        title="Bills"
        description="Create vendor bills that post to A/P through ledger rules."
        createLabel="Create bill"
        endpoint="/api/entities/bills"
        fields={[
          { key: "title", label: "Bill number", required: true },
          { key: "subtitle", label: "Vendor name", required: true },
          { key: "amountMinor", label: "Total (minor units)", type: "number", required: true },
          { key: "billDate", label: "Bill date", type: "date" },
          { key: "dueDate", label: "Due date", type: "date" },
          { key: "categoryAccountCode", label: "Expense account code", placeholder: "5000" }
        ]}
      />

      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
        <h2 className="text-lg font-semibold text-ink-900">Email approval links</h2>
        <p className="mt-1 text-sm text-slate-500">Generate one-click approve/reject links for a bill approver.</p>
        <DoubleRule className="my-4" />

        <form className="grid gap-3 md:grid-cols-3" onSubmit={(event) => void sendApprovalRequest(event)}>
          <Field label="Bill ID">
            <Input value={billId} onChange={(event) => setBillId(event.target.value)} placeholder="cuid from bill row" required />
          </Field>
          <Field label="Approver email">
            <Input value={approverEmail} type="email" onChange={(event) => setApproverEmail(event.target.value)} placeholder="approver@company.com" required />
          </Field>
          <div className="self-end">
            <Button type="submit" variant="accent" disabled={isSending}>
              {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
              Generate links
            </Button>
          </div>
        </form>

        {error ? <p className="mt-3 text-sm font-medium text-rust-700">{error}</p> : null}
        {preview ? (
          <div className="mt-3 rounded-[6px] border border-slate-200 bg-paper-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-ink-900">Preview for {preview.approverEmail}</p>
            <p className="mt-1 break-all"><span className="font-semibold">Approve:</span> {preview.approveLink}</p>
            <p className="mt-1 break-all"><span className="font-semibold">Reject:</span> {preview.rejectLink}</p>
            <p className="mt-1 text-xs">Expires: {new Date(preview.expiresAt).toLocaleString()}</p>
          </div>
        ) : null}
      </section>
    </div>
  );

  async function sendApprovalRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(`/api/expenses/bills/${billId}/approval-request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approverEmail })
      });

      const payload = (await response.json()) as { error?: string; emailPreview?: ApprovalPreview };
      if (!response.ok || !payload.emailPreview) {
        throw new Error(payload.error ?? "Failed to generate approval links.");
      }

      setPreview(payload.emailPreview);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to generate approval links.");
    } finally {
      setIsSending(false);
    }
  }
}
