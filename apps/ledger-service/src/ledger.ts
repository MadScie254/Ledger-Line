import type {
  Account,
  JournalEntry,
  JournalEntryInput,
  JournalLineInput,
  MoneyMinor,
  ProfitAndLoss,
  TrialBalanceRow
} from "@ledgerline/types";

const CENTS_PER_UNIT = 100;

export class LedgerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerValidationError";
  }
}

export function formatMoneyMinor(amountMinor: MoneyMinor, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amountMinor / CENTS_PER_UNIT);
}

export function assertBalancedLines(lines: JournalLineInput[]) {
  if (lines.length < 2) {
    throw new LedgerValidationError("A journal entry requires at least two lines.");
  }

  let debitTotal = 0;
  let creditTotal = 0;

  for (const [index, line] of lines.entries()) {
    const debit = line.debitMinor ?? 0;
    const credit = line.creditMinor ?? 0;

    if (!line.accountId) {
      throw new LedgerValidationError(`Line ${index + 1} is missing an account.`);
    }

    if (!Number.isInteger(debit) || !Number.isInteger(credit)) {
      throw new LedgerValidationError(`Line ${index + 1} contains a non-integer money amount.`);
    }

    if (debit < 0 || credit < 0) {
      throw new LedgerValidationError(`Line ${index + 1} contains a negative posting amount.`);
    }

    if (debit > 0 && credit > 0) {
      throw new LedgerValidationError(`Line ${index + 1} cannot contain both debit and credit.`);
    }

    if (debit === 0 && credit === 0) {
      throw new LedgerValidationError(`Line ${index + 1} must post either a debit or a credit.`);
    }

    debitTotal += debit;
    creditTotal += credit;
  }

  if (debitTotal !== creditTotal) {
    throw new LedgerValidationError(
      `Journal entry is unbalanced: debit ${debitTotal} does not equal credit ${creditTotal}.`
    );
  }

  return { debitTotal, creditTotal };
}

export function postJournalEntry(input: JournalEntryInput): JournalEntry {
  assertBalancedLines(input.lines);

  const entryId = createStableId("je", [
    input.orgId,
    input.entryDate,
    input.referenceNo ?? "",
    input.memo ?? "",
    input.lines.map((line) => `${line.accountId}:${line.debitMinor ?? 0}:${line.creditMinor ?? 0}`).join("|")
  ]);

  return {
    id: entryId,
    orgId: input.orgId,
    entryDate: input.entryDate,
    memo: input.memo,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    referenceNo: input.referenceNo,
    createdBy: input.createdBy,
    postedAt: new Date().toISOString(),
    lines: input.lines.map((line, index) => ({
      id: `${entryId}-line-${index + 1}`,
      journalEntryId: entryId,
      accountId: line.accountId,
      debitMinor: line.debitMinor ?? 0,
      creditMinor: line.creditMinor ?? 0,
      description: line.description,
      entityType: line.entityType,
      entityId: line.entityId
    }))
  };
}

export function reverseJournalEntry(entry: JournalEntry, createdBy: string, entryDate = new Date().toISOString()) {
  return postJournalEntry({
    orgId: entry.orgId,
    entryDate,
    memo: `Reversal of ${entry.referenceNo ?? entry.id}`,
    sourceType: "adjustment",
    sourceId: entry.id,
    referenceNo: `REV-${entry.referenceNo ?? entry.id.slice(0, 8)}`,
    createdBy,
    lines: entry.lines.map((line) => ({
      accountId: line.accountId,
      debitMinor: line.creditMinor,
      creditMinor: line.debitMinor,
      description: `Reverse: ${line.description ?? entry.memo ?? "journal line"}`,
      entityType: line.entityType,
      entityId: line.entityId
    }))
  });
}

export function calculateAccountBalances(entries: JournalEntry[]) {
  const balances = new Map<string, MoneyMinor>();

  for (const entry of entries) {
    for (const line of entry.lines) {
      balances.set(line.accountId, (balances.get(line.accountId) ?? 0) + line.debitMinor - line.creditMinor);
    }
  }

  return balances;
}

export function calculateTrialBalance(accounts: Account[], entries: JournalEntry[]): TrialBalanceRow[] {
  const balances = calculateAccountBalances(entries);

  return accounts.map((account) => {
    const normalBalance = normalBalanceSign(account.type);
    const rawBalance = balances.get(account.id) ?? 0;
    const signedBalance = rawBalance * normalBalance;

    return {
      account,
      debitMinor: signedBalance >= 0 ? signedBalance : 0,
      creditMinor: signedBalance < 0 ? Math.abs(signedBalance) : 0,
      balanceMinor: signedBalance
    };
  });
}

export function buildProfitAndLoss(accounts: Account[], entries: JournalEntry[], from: string, to: string): ProfitAndLoss {
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  let incomeMinor = 0;
  let cogsMinor = 0;
  let expenseMinor = 0;

  for (const entry of entries) {
    const timestamp = new Date(entry.entryDate).getTime();

    if (timestamp < start || timestamp > end) {
      continue;
    }

    for (const line of entry.lines) {
      const account = accountById.get(line.accountId);
      if (!account) {
        continue;
      }

      if (account.type === "income") {
        incomeMinor += line.creditMinor - line.debitMinor;
      }

      if (account.type === "cogs") {
        cogsMinor += line.debitMinor - line.creditMinor;
      }

      if (account.type === "expense") {
        expenseMinor += line.debitMinor - line.creditMinor;
      }
    }
  }

  return {
    incomeMinor,
    cogsMinor,
    expenseMinor,
    grossProfitMinor: incomeMinor - cogsMinor,
    netProfitMinor: incomeMinor - cogsMinor - expenseMinor
  };
}

function normalBalanceSign(type: Account["type"]) {
  if (type === "liability" || type === "equity" || type === "income") {
    return -1;
  }

  return 1;
}

function createStableId(prefix: string, parts: string[]) {
  let hash = 0;
  const input = parts.join("::");

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return `${prefix}_${Math.abs(hash).toString(36)}`;
}
