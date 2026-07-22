export type CurrencyCode = "KES" | "UGX" | "TZS" | "RWF" | "USD" | "EUR" | "GBP";

export type MoneyMinor = number;

export type AccountType = "asset" | "liability" | "equity" | "income" | "cogs" | "expense";

export type JournalSourceType =
  | "manual"
  | "invoice"
  | "bill"
  | "payment"
  | "payroll"
  | "bank"
  | "adjustment";

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  kraPin?: string;
  industry: string;
  fiscalYearStartMonth: number;
  baseCurrency: CurrencyCode;
  planTier: "free" | "growth" | "enterprise";
}

export interface Account {
  id: string;
  orgId: string;
  code: string;
  name: string;
  type: AccountType;
  subtype?: string;
  parentId?: string;
  currency: CurrencyCode;
  isActive: boolean;
}

export interface JournalLineInput {
  accountId: string;
  debitMinor?: MoneyMinor;
  creditMinor?: MoneyMinor;
  description?: string;
  entityType?: "customer" | "vendor" | "employee" | "project";
  entityId?: string;
}

export interface JournalLine extends Required<Pick<JournalLineInput, "accountId">> {
  id: string;
  journalEntryId: string;
  debitMinor: MoneyMinor;
  creditMinor: MoneyMinor;
  description?: string;
  entityType?: "customer" | "vendor" | "employee" | "project";
  entityId?: string;
}

export interface JournalEntryInput {
  orgId: string;
  entryDate: string;
  memo?: string;
  sourceType: JournalSourceType;
  sourceId?: string;
  referenceNo?: string;
  createdBy: string;
  lines: JournalLineInput[];
}

export interface JournalEntry {
  id: string;
  orgId: string;
  entryDate: string;
  memo?: string;
  sourceType: JournalSourceType;
  sourceId?: string;
  referenceNo?: string;
  createdBy: string;
  postedAt: string;
  isReversalOf?: string;
  lines: JournalLine[];
}

export interface TrialBalanceRow {
  account: Account;
  debitMinor: MoneyMinor;
  creditMinor: MoneyMinor;
  balanceMinor: MoneyMinor;
}

export interface ProfitAndLoss {
  incomeMinor: MoneyMinor;
  cogsMinor: MoneyMinor;
  expenseMinor: MoneyMinor;
  grossProfitMinor: MoneyMinor;
  netProfitMinor: MoneyMinor;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amountMinor: MoneyMinor;
  direction: "in" | "out";
  status: "unreviewed" | "categorized" | "matched" | "excluded";
  aiSuggestedCategory: string;
  confidence: number;
}

export interface InvoiceSummary {
  id: string;
  invoiceNo: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void";
  totalMinor: MoneyMinor;
  balanceDueMinor: MoneyMinor;
}

export interface BusinessFeedItem {
  id: string;
  severity: "info" | "success" | "warning" | "critical";
  title: string;
  body: string;
  amountMinor?: MoneyMinor;
  link: string;
}
