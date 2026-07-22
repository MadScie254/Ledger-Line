import type { Account, BankTransaction, BusinessFeedItem, InvoiceSummary, Organization } from "@ledgerline/types";
import { buildProfitAndLoss, calculateAccountBalances, calculateTrialBalance, postJournalEntry } from "@ledgerline/ledger-service";

export const organization: Organization = {
  id: "org-ledgerline-demo",
  name: "Akili Traders",
  legalName: "Akili Traders Limited",
  kraPin: "P052618349Z",
  industry: "Wholesale distribution",
  fiscalYearStartMonth: 1,
  baseCurrency: "KES",
  planTier: "enterprise"
};

export const accounts: Account[] = [
  account("bank-main", "1000", "Equity Bank operating", "asset", "Bank"),
  account("mpesa", "1010", "M-Pesa till", "asset", "Mobile money"),
  account("receivable", "1200", "Accounts receivable", "asset", "Current asset"),
  account("inventory", "1400", "Inventory", "asset", "Stock"),
  account("payable", "2000", "Accounts payable", "liability", "Current liability"),
  account("vat-payable", "2150", "VAT payable", "liability", "Tax"),
  account("retained", "3000", "Retained earnings", "equity", "Equity"),
  account("sales", "4000", "Product sales", "income", "Operating income"),
  account("services", "4100", "Service revenue", "income", "Operating income"),
  account("cogs", "5000", "Cost of goods sold", "cogs", "Direct cost"),
  account("payroll", "6100", "Payroll expense", "expense", "People"),
  account("rent", "6200", "Rent expense", "expense", "Facilities"),
  account("fuel", "6300", "Fuel and logistics", "expense", "Logistics"),
  account("bank-fees", "6400", "Bank and M-Pesa fees", "expense", "Fees")
];

export const journalEntries = [
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-01",
    memo: "Opening operating capital",
    sourceType: "manual",
    referenceNo: "OPEN-2026-07",
    createdBy: "system",
    lines: [
      { accountId: "bank-main", debitMinor: 5_000_00000, description: "Opening bank balance" },
      { accountId: "retained", creditMinor: 5_000_00000, description: "Opening equity" }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-03",
    memo: "Invoice to Kijani Grocers",
    sourceType: "invoice",
    sourceId: "inv-1024",
    referenceNo: "INV-1024",
    createdBy: "mary",
    lines: [
      { accountId: "receivable", debitMinor: 1_612_00000, entityType: "customer", entityId: "cust-kijani" },
      { accountId: "services", creditMinor: 1_390_00000, entityType: "customer", entityId: "cust-kijani" },
      { accountId: "vat-payable", creditMinor: 222_00000, entityType: "customer", entityId: "cust-kijani" }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-05",
    memo: "M-Pesa walk-in sales",
    sourceType: "payment",
    sourceId: "mpesa-20260705",
    referenceNo: "MPESA-7352",
    createdBy: "samuel",
    lines: [
      { accountId: "mpesa", debitMinor: 640_00000, description: "Till collection" },
      { accountId: "sales", creditMinor: 551_72400, description: "Retail sales net of VAT" },
      { accountId: "vat-payable", creditMinor: 88_27600, description: "Output VAT" }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-08",
    memo: "Partial payment from Kijani Grocers",
    sourceType: "payment",
    sourceId: "pay-1024-a",
    referenceNo: "RCPT-2210",
    createdBy: "mary",
    lines: [
      { accountId: "bank-main", debitMinor: 1_200_00000, entityType: "customer", entityId: "cust-kijani" },
      { accountId: "receivable", creditMinor: 1_200_00000, entityType: "customer", entityId: "cust-kijani" }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-10",
    memo: "Supplier bill for packaged goods",
    sourceType: "bill",
    sourceId: "bill-884",
    referenceNo: "BILL-884",
    createdBy: "grace",
    lines: [
      { accountId: "cogs", debitMinor: 450_00000, entityType: "vendor", entityId: "vend-nakuru" },
      { accountId: "payable", creditMinor: 450_00000, entityType: "vendor", entityId: "vend-nakuru" }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-12",
    memo: "Logistics fuel",
    sourceType: "expense",
    sourceId: "exp-742",
    referenceNo: "EXP-742",
    createdBy: "samuel",
    lines: [
      { accountId: "fuel", debitMinor: 136_50000, entityType: "project", entityId: "proj-nairobi-route" },
      { accountId: "bank-main", creditMinor: 136_50000 }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-15",
    memo: "Monthly payroll",
    sourceType: "payroll",
    sourceId: "payrun-2026-07-a",
    referenceNo: "PAY-2026-07-A",
    createdBy: "grace",
    lines: [
      { accountId: "payroll", debitMinor: 820_00000 },
      { accountId: "bank-main", creditMinor: 820_00000 }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-18",
    memo: "Warehouse rent",
    sourceType: "expense",
    sourceId: "exp-744",
    referenceNo: "EXP-744",
    createdBy: "grace",
    lines: [
      { accountId: "rent", debitMinor: 240_00000 },
      { accountId: "bank-main", creditMinor: 240_00000 }
    ]
  }),
  postJournalEntry({
    orgId: organization.id,
    entryDate: "2026-07-20",
    memo: "M-Pesa settlement fee",
    sourceType: "bank",
    sourceId: "bank-721",
    referenceNo: "BANK-721",
    createdBy: "system",
    lines: [
      { accountId: "bank-fees", debitMinor: 18_40000 },
      { accountId: "mpesa", creditMinor: 18_40000 }
    ]
  })
];

export const invoices: InvoiceSummary[] = [
  {
    id: "inv-1024",
    invoiceNo: "INV-1024",
    customerName: "Kijani Grocers",
    issueDate: "2026-07-03",
    dueDate: "2026-07-24",
    status: "partial",
    totalMinor: 1_612_00000,
    balanceDueMinor: 412_00000
  },
  {
    id: "inv-1025",
    invoiceNo: "INV-1025",
    customerName: "Lakefront Hotels",
    issueDate: "2026-07-16",
    dueDate: "2026-07-30",
    status: "viewed",
    totalMinor: 884_50000,
    balanceDueMinor: 884_50000
  },
  {
    id: "inv-1026",
    invoiceNo: "INV-1026",
    customerName: "Mara Essentials",
    issueDate: "2026-07-19",
    dueDate: "2026-08-02",
    status: "sent",
    totalMinor: 326_40000,
    balanceDueMinor: 326_40000
  }
];

export const bankTransactions: BankTransaction[] = [
  {
    id: "bt-1001",
    date: "2026-07-20",
    description: "SAFARICOM STK SETTLEMENT 7352",
    amountMinor: 621_60000,
    direction: "in",
    status: "matched",
    aiSuggestedCategory: "M-Pesa till",
    confidence: 0.98
  },
  {
    id: "bt-1002",
    date: "2026-07-18",
    description: "WAREHOUSE LEASE - ATHI RIVER",
    amountMinor: 240_00000,
    direction: "out",
    status: "categorized",
    aiSuggestedCategory: "Rent expense",
    confidence: 0.94
  },
  {
    id: "bt-1003",
    date: "2026-07-16",
    description: "TOTALENERGIES TRUCK FUEL",
    amountMinor: 136_50000,
    direction: "out",
    status: "unreviewed",
    aiSuggestedCategory: "Fuel and logistics",
    confidence: 0.87
  },
  {
    id: "bt-1004",
    date: "2026-07-08",
    description: "KIJANI GROCERS EFT",
    amountMinor: 1_200_00000,
    direction: "in",
    status: "matched",
    aiSuggestedCategory: "Invoice payment",
    confidence: 0.99
  }
];

export const businessFeed: BusinessFeedItem[] = [
  {
    id: "feed-1",
    severity: "warning",
    title: "Fuel spend is 28% above the prior 30-day average",
    body: "The increase is concentrated on the Nairobi route project. Review the uncategorized TotalEnergies transaction before close.",
    amountMinor: 136_50000,
    link: "/banking/transactions"
  },
  {
    id: "feed-2",
    severity: "success",
    title: "Kijani Grocers payment matched cleanly",
    body: "Receipt RCPT-2210 reduced INV-1024 and left KES 412,000.00 outstanding.",
    amountMinor: 1_200_00000,
    link: "/sales/invoices"
  },
  {
    id: "feed-3",
    severity: "info",
    title: "VAT output estimate is ready",
    body: "July output VAT from posted sales currently exceeds input VAT by KES 310,276.00.",
    amountMinor: 310_27600,
    link: "/tax/vat"
  }
];

export const cashFlowSeries = [
  { month: "Aug", actual: 1_180_000, projected: 1_240_000 },
  { month: "Sep", actual: 1_260_000, projected: 1_320_000 },
  { month: "Oct", actual: 1_090_000, projected: 1_180_000 },
  { month: "Nov", actual: 1_380_000, projected: 1_450_000 },
  { month: "Dec", actual: 1_640_000, projected: 1_720_000 },
  { month: "Jan", actual: 1_220_000, projected: 1_330_000 },
  { month: "Feb", actual: 1_440_000, projected: 1_520_000 },
  { month: "Mar", actual: 1_310_000, projected: 1_390_000 },
  { month: "Apr", actual: 1_580_000, projected: 1_650_000 },
  { month: "May", actual: 1_720_000, projected: 1_810_000 },
  { month: "Jun", actual: 1_640_000, projected: 1_760_000 },
  { month: "Jul", actual: 1_966_700, projected: 2_080_000 }
];

export const expenseBreakdown = [
  { name: "Payroll", value: 820000 },
  { name: "COGS", value: 450000 },
  { name: "Rent", value: 240000 },
  { name: "Fuel", value: 136500 },
  { name: "Fees", value: 18400 }
];

export const setupTasks = [
  { label: "Company profile", done: true },
  { label: "Chart of accounts", done: true },
  { label: "Invite accountant", done: false },
  { label: "Connect bank feed", done: false },
  { label: "Configure eTIMS", done: false },
  { label: "Set invoice template", done: true }
];

export function getDashboardModel() {
  const pnl = buildProfitAndLoss(accounts, journalEntries, "2026-07-01", "2026-07-31");
  const balances = calculateAccountBalances(journalEntries);
  const cashBalanceMinor = (balances.get("bank-main") ?? 0) + (balances.get("mpesa") ?? 0);
  const arBalanceMinor = balances.get("receivable") ?? 0;
  const apBalanceMinor = Math.abs(balances.get("payable") ?? 0);
  const trialBalance = calculateTrialBalance(accounts, journalEntries);
  const totalDebits = trialBalance.reduce((sum, row) => sum + row.debitMinor, 0);
  const totalCredits = trialBalance.reduce((sum, row) => sum + row.creditMinor, 0);

  return {
    organization,
    pnl,
    cashBalanceMinor,
    arBalanceMinor,
    apBalanceMinor,
    trialBalance,
    isTrialBalanceClean: totalDebits === totalCredits,
    totalDebits,
    totalCredits,
    cashFlowSeries,
    expenseBreakdown,
    invoices,
    bankTransactions,
    businessFeed,
    setupTasks
  };
}

function account(id: string, code: string, name: string, type: Account["type"], subtype: string): Account {
  return {
    id,
    orgId: organization.id,
    code,
    name,
    type,
    subtype,
    currency: organization.baseCurrency,
    isActive: true
  };
}
