import { describe, expect, it } from "vitest";
import type { Account } from "@ledgerline/types";
import {
  LedgerValidationError,
  buildProfitAndLoss,
  calculateTrialBalance,
  postJournalEntry,
  reverseJournalEntry
} from "../src";

const accounts: Account[] = [
  {
    id: "cash",
    orgId: "org",
    code: "1000",
    name: "Cash and bank",
    type: "asset",
    currency: "KES",
    isActive: true
  },
  {
    id: "receivable",
    orgId: "org",
    code: "1200",
    name: "Accounts receivable",
    type: "asset",
    currency: "KES",
    isActive: true
  },
  {
    id: "revenue",
    orgId: "org",
    code: "4000",
    name: "Service revenue",
    type: "income",
    currency: "KES",
    isActive: true
  },
  {
    id: "expense",
    orgId: "org",
    code: "6100",
    name: "Operating expense",
    type: "expense",
    currency: "KES",
    isActive: true
  }
];

describe("ledger posting", () => {
  it("posts a balanced journal entry", () => {
    const entry = postJournalEntry({
      orgId: "org",
      entryDate: "2026-07-22",
      sourceType: "invoice",
      referenceNo: "INV-1001",
      createdBy: "user",
      lines: [
        { accountId: "receivable", debitMinor: 125000 },
        { accountId: "revenue", creditMinor: 125000 }
      ]
    });

    expect(entry.lines).toHaveLength(2);
    expect(entry.lines.reduce((sum, line) => sum + line.debitMinor, 0)).toBe(125000);
    expect(entry.lines.reduce((sum, line) => sum + line.creditMinor, 0)).toBe(125000);
  });

  it("rejects unbalanced entries before they can post", () => {
    expect(() =>
      postJournalEntry({
        orgId: "org",
        entryDate: "2026-07-22",
        sourceType: "manual",
        createdBy: "user",
        lines: [
          { accountId: "cash", debitMinor: 10000 },
          { accountId: "revenue", creditMinor: 9000 }
        ]
      })
    ).toThrow(LedgerValidationError);
  });

  it("rejects floating point money amounts", () => {
    expect(() =>
      postJournalEntry({
        orgId: "org",
        entryDate: "2026-07-22",
        sourceType: "expense",
        createdBy: "user",
        lines: [
          { accountId: "expense", debitMinor: 100.25 },
          { accountId: "cash", creditMinor: 100.25 }
        ]
      })
    ).toThrow(/non-integer/);
  });

  it("creates exact reversals", () => {
    const entry = postJournalEntry({
      orgId: "org",
      entryDate: "2026-07-22",
      sourceType: "payment",
      createdBy: "user",
      lines: [
        { accountId: "cash", debitMinor: 50000 },
        { accountId: "receivable", creditMinor: 50000 }
      ]
    });
    const reversal = reverseJournalEntry(entry, "controller", "2026-07-23");

    expect(reversal.lines[0]?.creditMinor).toBe(50000);
    expect(reversal.lines[1]?.debitMinor).toBe(50000);
  });

  it("derives profit and loss from journal lines", () => {
    const invoice = postJournalEntry({
      orgId: "org",
      entryDate: "2026-07-22",
      sourceType: "invoice",
      createdBy: "user",
      lines: [
        { accountId: "receivable", debitMinor: 250000 },
        { accountId: "revenue", creditMinor: 250000 }
      ]
    });
    const expense = postJournalEntry({
      orgId: "org",
      entryDate: "2026-07-22",
      sourceType: "expense",
      createdBy: "user",
      lines: [
        { accountId: "expense", debitMinor: 70000 },
        { accountId: "cash", creditMinor: 70000 }
      ]
    });

    const pnl = buildProfitAndLoss(accounts, [invoice, expense], "2026-07-01", "2026-07-31");

    expect(pnl.incomeMinor).toBe(250000);
    expect(pnl.expenseMinor).toBe(70000);
    expect(pnl.netProfitMinor).toBe(180000);
  });

  it("produces a balanced trial balance", () => {
    const invoice = postJournalEntry({
      orgId: "org",
      entryDate: "2026-07-22",
      sourceType: "invoice",
      createdBy: "user",
      lines: [
        { accountId: "receivable", debitMinor: 250000 },
        { accountId: "revenue", creditMinor: 250000 }
      ]
    });

    const rows = calculateTrialBalance(accounts, [invoice]);
    const totalDebit = rows.reduce((sum, row) => sum + row.debitMinor, 0);
    const totalCredit = rows.reduce((sum, row) => sum + row.creditMinor, 0);

    expect(totalDebit).toBe(totalCredit);
  });
});
