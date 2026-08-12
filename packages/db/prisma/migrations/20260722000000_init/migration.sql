-- =============================================================================
-- LedgerLine — Complete baseline migration
-- Replaces the original stub that only added CHECK constraints without first
-- creating the tables.  This DDL creates every table defined in schema.prisma
-- in topological dependency order, followed by the double-entry guardrails.
-- Must apply cleanly to an empty database.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE "OrgPlanTier"            AS ENUM ('FREE', 'GROWTH', 'ENTERPRISE');
CREATE TYPE "MembershipStatus"       AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED');
CREATE TYPE "AccountType"            AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'COGS', 'EXPENSE');
CREATE TYPE "AccountingPeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');
CREATE TYPE "JournalSourceType"      AS ENUM ('MANUAL', 'INVOICE', 'BILL', 'EXPENSE', 'PAYMENT', 'PAYROLL', 'BANK', 'ADJUSTMENT');
CREATE TYPE "BankTransactionStatus"  AS ENUM ('UNREVIEWED', 'CATEGORIZED', 'MATCHED', 'EXCLUDED');
CREATE TYPE "MoneyDirection"         AS ENUM ('IN', 'OUT');
CREATE TYPE "ProductType"            AS ENUM ('INVENTORY', 'NON_INVENTORY', 'SERVICE', 'BUNDLE');
CREATE TYPE "InvoiceStatus"          AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID');
CREATE TYPE "EstimateStatus"         AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CONVERTED');
CREATE TYPE "BillStatus"             AS ENUM ('OPEN', 'PARTIAL', 'PAID', 'OVERDUE');
CREATE TYPE "TaxRateType"            AS ENUM ('OUTPUT', 'INPUT', 'WITHHOLDING');
CREATE TYPE "TaxReturnType"          AS ENUM ('VAT', 'PAYE', 'NSSF', 'SHIF', 'WITHHOLDING');
CREATE TYPE "TaxReturnStatus"        AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'ACCEPTED', 'REJECTED');
CREATE TYPE "EmployeeStatus"         AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');
CREATE TYPE "PayRunStatus"           AS ENUM ('DRAFT', 'APPROVED', 'PAID');
CREATE TYPE "ProjectStatus"          AS ENUM ('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED');
CREATE TYPE "IntegrationStatus"      AS ENUM ('CONNECTED', 'NEEDS_ATTENTION', 'DISCONNECTED');

-- ---------------------------------------------------------------------------
-- Organization  (no deps)
-- ---------------------------------------------------------------------------

CREATE TABLE "Organization" (
    "id"                   TEXT            NOT NULL,
    "name"                 TEXT            NOT NULL,
    "legalName"            TEXT,
    "kraPin"               TEXT,
    "taxId"                TEXT,
    "industry"             TEXT,
    "fiscalYearStartMonth" INTEGER         NOT NULL DEFAULT 1,
    "baseCurrency"         TEXT            NOT NULL DEFAULT 'KES',
    "address"              JSONB,
    "logoUrl"              TEXT,
    "planTier"             "OrgPlanTier"   NOT NULL DEFAULT 'FREE',
    "createdAt"            TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- User  (FK → Organization optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "User" (
    "id"         TEXT         NOT NULL,
    "orgId"      TEXT,
    "name"       TEXT         NOT NULL,
    "email"      TEXT         NOT NULL,
    "phone"      TEXT,
    "mfaEnabled" BOOLEAN      NOT NULL DEFAULT false,
    "avatarUrl"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey"       PRIMARY KEY ("id"),
    CONSTRAINT "User_email_key"  UNIQUE ("email")
);

-- ---------------------------------------------------------------------------
-- Role  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "Role" (
    "id"           TEXT         NOT NULL,
    "orgId"        TEXT         NOT NULL,
    "name"         TEXT         NOT NULL,
    "isSystemRole" BOOLEAN      NOT NULL DEFAULT false,
    "permissions"  JSONB        NOT NULL,
    CONSTRAINT "Role_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "Role_orgId_name_key" UNIQUE ("orgId", "name")
);

-- ---------------------------------------------------------------------------
-- OrgMembership  (FK → User, Organization, Role)
-- ---------------------------------------------------------------------------

CREATE TABLE "OrgMembership" (
    "userId" TEXT               NOT NULL,
    "orgId"  TEXT               NOT NULL,
    "roleId" TEXT               NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    CONSTRAINT "OrgMembership_pkey" PRIMARY KEY ("userId", "orgId")
);

-- ---------------------------------------------------------------------------
-- Account  (FK → Organization; self-ref parentId)
-- ---------------------------------------------------------------------------

CREATE TABLE "Account" (
    "id"                 TEXT          NOT NULL,
    "orgId"              TEXT          NOT NULL,
    "code"               TEXT          NOT NULL,
    "name"               TEXT          NOT NULL,
    "type"               "AccountType" NOT NULL,
    "subtype"            TEXT,
    "parentId"           TEXT,
    "currency"           TEXT          NOT NULL DEFAULT 'KES',
    "isActive"           BOOLEAN       NOT NULL DEFAULT true,
    "openingBalance"     DECIMAL(18,2) NOT NULL DEFAULT 0,
    "openingBalanceDate" TIMESTAMP(3),
    CONSTRAINT "Account_pkey"          PRIMARY KEY ("id"),
    CONSTRAINT "Account_orgId_code_key" UNIQUE ("orgId", "code")
);

-- ---------------------------------------------------------------------------
-- AccountingPeriod  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "AccountingPeriod" (
    "id"        TEXT                     NOT NULL,
    "orgId"     TEXT                     NOT NULL,
    "startDate" TIMESTAMP(3)             NOT NULL,
    "endDate"   TIMESTAMP(3)             NOT NULL,
    "status"    "AccountingPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closedBy"  TEXT,
    "closedAt"  TIMESTAMP(3),
    CONSTRAINT "AccountingPeriod_pkey"                     PRIMARY KEY ("id"),
    CONSTRAINT "AccountingPeriod_orgId_startDate_endDate_key" UNIQUE ("orgId", "startDate", "endDate")
);

-- ---------------------------------------------------------------------------
-- JournalEntry  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "JournalEntry" (
    "id"          TEXT                NOT NULL,
    "orgId"       TEXT                NOT NULL,
    "entryDate"   TIMESTAMP(3)        NOT NULL,
    "memo"        TEXT,
    "sourceType"  "JournalSourceType" NOT NULL,
    "sourceId"    TEXT,
    "referenceNo" TEXT,
    "createdBy"   TEXT                NOT NULL,
    "postedAt"    TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isReversalOf" TEXT,
    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- JournalLine  (FK → JournalEntry, Account)
-- ---------------------------------------------------------------------------

CREATE TABLE "JournalLine" (
    "id"             TEXT          NOT NULL,
    "journalEntryId" TEXT          NOT NULL,
    "accountId"      TEXT          NOT NULL,
    "debit"          DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit"         DECIMAL(18,2) NOT NULL DEFAULT 0,
    "description"    TEXT,
    "entityType"     TEXT,
    "entityId"       TEXT,
    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- BankConnection  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "BankConnection" (
    "id"              TEXT          NOT NULL,
    "orgId"           TEXT          NOT NULL,
    "institutionName" TEXT          NOT NULL,
    "accountNoMasked" TEXT          NOT NULL,
    "currency"        TEXT          NOT NULL DEFAULT 'KES',
    "provider"        TEXT          NOT NULL,
    "lastSyncedAt"    TIMESTAMP(3),
    "currentBalance"  DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- BankTransaction  (FK → BankConnection, JournalEntry optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "BankTransaction" (
    "id"                    TEXT                    NOT NULL,
    "bankConnectionId"      TEXT                    NOT NULL,
    "date"                  TIMESTAMP(3)            NOT NULL,
    "description"           TEXT                    NOT NULL,
    "amount"                DECIMAL(18,2)           NOT NULL,
    "direction"             "MoneyDirection"        NOT NULL,
    "status"                "BankTransactionStatus" NOT NULL DEFAULT 'UNREVIEWED',
    "matchedJournalEntryId" TEXT,
    "aiSuggestedCategory"   TEXT,
    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- BankRule  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "BankRule" (
    "id"              TEXT     NOT NULL,
    "orgId"           TEXT     NOT NULL,
    "matchConditions" JSONB    NOT NULL,
    "actions"         JSONB    NOT NULL,
    "priority"        INTEGER  NOT NULL DEFAULT 100,
    CONSTRAINT "BankRule_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- TaxRate  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "TaxRate" (
    "id"            TEXT           NOT NULL,
    "orgId"         TEXT           NOT NULL,
    "name"          TEXT           NOT NULL,
    "ratePct"       DECIMAL(8,4)   NOT NULL,
    "type"          "TaxRateType"  NOT NULL,
    "jurisdiction"  TEXT           NOT NULL,
    "kraCode"       TEXT,
    "effectiveFrom" TIMESTAMP(3)   NOT NULL,
    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Customer  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "Customer" (
    "id"              TEXT          NOT NULL,
    "orgId"           TEXT          NOT NULL,
    "displayName"     TEXT          NOT NULL,
    "companyName"     TEXT,
    "emails"          TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    "phones"          TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    "billingAddress"  JSONB,
    "shippingAddress" JSONB,
    "paymentTerms"    TEXT,
    "currency"        TEXT          NOT NULL DEFAULT 'KES',
    "balance"         DECIMAL(18,2) NOT NULL DEFAULT 0,
    "creditLimit"     DECIMAL(18,2),
    "tags"            TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Product  (FK → Organization, Account ×2, TaxRate)
-- ---------------------------------------------------------------------------

CREATE TABLE "Product" (
    "id"               TEXT          NOT NULL,
    "orgId"            TEXT          NOT NULL,
    "name"             TEXT          NOT NULL,
    "sku"              TEXT,
    "type"             "ProductType" NOT NULL,
    "salesPrice"       DECIMAL(18,2) NOT NULL DEFAULT 0,
    "cost"             DECIMAL(18,2) NOT NULL DEFAULT 0,
    "incomeAccountId"  TEXT,
    "expenseAccountId" TEXT,
    "qtyOnHand"        DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reorderPoint"     DECIMAL(18,4),
    "taxRateId"        TEXT,
    CONSTRAINT "Product_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "Product_orgId_sku_key"  UNIQUE ("orgId", "sku")
);

-- ---------------------------------------------------------------------------
-- Vendor  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "Vendor" (
    "id"           TEXT          NOT NULL,
    "orgId"        TEXT          NOT NULL,
    "displayName"  TEXT          NOT NULL,
    "emails"       TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    "phones"       TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    "address"      JSONB,
    "taxId"        TEXT,
    "paymentTerms" TEXT,
    "balance"      DECIMAL(18,2) NOT NULL DEFAULT 0,
    "category"     TEXT,
    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Invoice  (FK → Organization, Customer)
-- ---------------------------------------------------------------------------

CREATE TABLE "Invoice" (
    "id"                  TEXT            NOT NULL,
    "orgId"               TEXT            NOT NULL,
    "customerId"          TEXT            NOT NULL,
    "invoiceNo"           TEXT            NOT NULL,
    "issueDate"           TIMESTAMP(3)    NOT NULL,
    "dueDate"             TIMESTAMP(3)    NOT NULL,
    "terms"               TEXT,
    "status"              "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal"            DECIMAL(18,2)   NOT NULL DEFAULT 0,
    "taxTotal"            DECIMAL(18,2)   NOT NULL DEFAULT 0,
    "discountTotal"       DECIMAL(18,2)   NOT NULL DEFAULT 0,
    "total"               DECIMAL(18,2)   NOT NULL DEFAULT 0,
    "amountPaid"          DECIMAL(18,2)   NOT NULL DEFAULT 0,
    "balanceDue"          DECIMAL(18,2)   NOT NULL DEFAULT 0,
    "currency"            TEXT            NOT NULL DEFAULT 'KES',
    "fxRate"              DECIMAL(18,8)   NOT NULL DEFAULT 1,
    "message"             TEXT,
    "footer"              TEXT,
    "recurringTemplateId" TEXT,
    CONSTRAINT "Invoice_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "Invoice_orgId_invoiceNo_key" UNIQUE ("orgId", "invoiceNo")
);

-- ---------------------------------------------------------------------------
-- InvoiceLine  (FK → Invoice, Product optional, TaxRate optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "InvoiceLine" (
    "id"          TEXT          NOT NULL,
    "invoiceId"   TEXT          NOT NULL,
    "productId"   TEXT,
    "description" TEXT          NOT NULL,
    "qty"         DECIMAL(18,4) NOT NULL DEFAULT 1,
    "unitPrice"   DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxRateId"   TEXT,
    "amount"      DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Estimate  (FK → Organization, Customer)
-- ---------------------------------------------------------------------------

CREATE TABLE "Estimate" (
    "id"            TEXT             NOT NULL,
    "orgId"         TEXT             NOT NULL,
    "customerId"    TEXT             NOT NULL,
    "estimateNo"    TEXT             NOT NULL,
    "issueDate"     TIMESTAMP(3)     NOT NULL,
    "expiryDate"    TIMESTAMP(3),
    "status"        "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal"      DECIMAL(18,2)    NOT NULL DEFAULT 0,
    "taxTotal"      DECIMAL(18,2)    NOT NULL DEFAULT 0,
    "total"         DECIMAL(18,2)    NOT NULL DEFAULT 0,
    "currency"      TEXT             NOT NULL DEFAULT 'KES',
    "fxRate"        DECIMAL(18,8)    NOT NULL DEFAULT 1,
    "message"       TEXT,
    "footer"        TEXT,
    "convertedToId" TEXT,
    CONSTRAINT "Estimate_pkey"               PRIMARY KEY ("id"),
    CONSTRAINT "Estimate_orgId_estimateNo_key" UNIQUE ("orgId", "estimateNo")
);

-- ---------------------------------------------------------------------------
-- EstimateLine  (FK → Estimate, Product optional, TaxRate optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "EstimateLine" (
    "id"          TEXT          NOT NULL,
    "estimateId"  TEXT          NOT NULL,
    "productId"   TEXT,
    "description" TEXT          NOT NULL,
    "qty"         DECIMAL(18,4) NOT NULL DEFAULT 1,
    "unitPrice"   DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxRateId"   TEXT,
    "amount"      DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT "EstimateLine_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- SalesReceipt  (FK → Organization, Customer optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "SalesReceipt" (
    "id"               TEXT         NOT NULL,
    "orgId"            TEXT         NOT NULL,
    "customerId"       TEXT,
    "date"             TIMESTAMP(3) NOT NULL,
    "lines"            JSONB        NOT NULL,
    "paymentMethod"    TEXT         NOT NULL,
    "depositAccountId" TEXT         NOT NULL,
    CONSTRAINT "SalesReceipt_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- SalesOrder  (FK → Organization, Customer optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "SalesOrder" (
    "id"                TEXT         NOT NULL,
    "orgId"             TEXT         NOT NULL,
    "customerId"        TEXT,
    "lines"             JSONB        NOT NULL,
    "status"            TEXT         NOT NULL,
    "fulfillmentStatus" TEXT,
    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- PaymentReceived  (FK → Organization, Customer, Invoice optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "PaymentReceived" (
    "id"               TEXT          NOT NULL,
    "orgId"            TEXT          NOT NULL,
    "customerId"       TEXT          NOT NULL,
    "invoiceId"        TEXT,
    "amount"           DECIMAL(18,2) NOT NULL,
    "date"             TIMESTAMP(3)  NOT NULL,
    "method"           TEXT          NOT NULL,
    "depositAccountId" TEXT          NOT NULL,
    "appliedTo"        JSONB         NOT NULL,
    "reference"        TEXT,
    CONSTRAINT "PaymentReceived_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- RecurringTemplate  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "RecurringTemplate" (
    "id"           TEXT         NOT NULL,
    "orgId"        TEXT         NOT NULL,
    "sourceType"   TEXT         NOT NULL,
    "scheduleCron" TEXT         NOT NULL,
    "startDate"    TIMESTAMP(3) NOT NULL,
    "endDate"      TIMESTAMP(3),
    "occurrences"  INTEGER,
    "nextRunAt"    TIMESTAMP(3) NOT NULL,
    "autoSend"     BOOLEAN      NOT NULL DEFAULT false,
    CONSTRAINT "RecurringTemplate_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Bill  (FK → Organization, Vendor)
-- ---------------------------------------------------------------------------

CREATE TABLE "Bill" (
    "id"         TEXT          NOT NULL,
    "orgId"      TEXT          NOT NULL,
    "vendorId"   TEXT          NOT NULL,
    "billNo"     TEXT          NOT NULL,
    "billDate"   TIMESTAMP(3)  NOT NULL,
    "dueDate"    TIMESTAMP(3)  NOT NULL,
    "status"     "BillStatus"  NOT NULL DEFAULT 'OPEN',
    "subtotal"   DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxTotal"   DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total"      DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT "Bill_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "Bill_orgId_billNo_key" UNIQUE ("orgId", "billNo")
);

-- ---------------------------------------------------------------------------
-- BillLine  (FK → Bill, Account optional, Product optional, TaxRate optional, Customer optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "BillLine" (
    "id"          TEXT          NOT NULL,
    "billId"      TEXT          NOT NULL,
    "accountId"   TEXT,
    "productId"   TEXT,
    "description" TEXT          NOT NULL,
    "qty"         DECIMAL(18,4) NOT NULL DEFAULT 1,
    "unitPrice"   DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxRateId"   TEXT,
    "amount"      DECIMAL(18,2) NOT NULL DEFAULT 0,
    "isBillable"  BOOLEAN       NOT NULL DEFAULT false,
    "customerId"  TEXT,
    CONSTRAINT "BillLine_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Expense  (FK → Organization, Account ×2, TaxRate optional, Customer optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "Expense" (
    "id"                TEXT          NOT NULL,
    "orgId"             TEXT          NOT NULL,
    "payee"             TEXT          NOT NULL,
    "date"              TIMESTAMP(3)  NOT NULL,
    "paymentAccountId"  TEXT          NOT NULL,
    "categoryAccountId" TEXT          NOT NULL,
    "amount"            DECIMAL(18,2) NOT NULL,
    "taxRateId"         TEXT,
    "isBillable"        BOOLEAN       NOT NULL DEFAULT false,
    "customerId"        TEXT,
    "receiptUrl"        TEXT,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- PurchaseOrder  (FK → Organization, Vendor)
-- ---------------------------------------------------------------------------

CREATE TABLE "PurchaseOrder" (
    "id"       TEXT NOT NULL,
    "orgId"    TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "lines"    JSONB NOT NULL,
    "status"   TEXT NOT NULL,
    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- BillPayment  (FK → Organization, Bill optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "BillPayment" (
    "id"               TEXT          NOT NULL,
    "orgId"            TEXT          NOT NULL,
    "billId"           TEXT,
    "billIds"          JSONB,
    "amount"           DECIMAL(18,2) NOT NULL,
    "date"             TIMESTAMP(3)  NOT NULL,
    "paymentAccountId" TEXT          NOT NULL,
    "method"           TEXT          NOT NULL,
    "reference"        TEXT,
    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- TaxReturn  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "TaxReturn" (
    "id"           TEXT              NOT NULL,
    "orgId"        TEXT              NOT NULL,
    "periodStart"  TIMESTAMP(3)      NOT NULL,
    "periodEnd"    TIMESTAMP(3)      NOT NULL,
    "type"         "TaxReturnType"   NOT NULL,
    "status"       "TaxReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "totalDue"     DECIMAL(18,2)     NOT NULL DEFAULT 0,
    "submittedRef" TEXT,
    "filedAt"      TIMESTAMP(3),
    CONSTRAINT "TaxReturn_pkey"                             PRIMARY KEY ("id"),
    CONSTRAINT "TaxReturn_orgId_type_periodStart_periodEnd_key" UNIQUE ("orgId", "type", "periodStart", "periodEnd")
);

-- ---------------------------------------------------------------------------
-- Employee  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "Employee" (
    "id"              TEXT             NOT NULL,
    "orgId"           TEXT             NOT NULL,
    "name"            TEXT             NOT NULL,
    "nationalId"      TEXT,
    "kraPin"          TEXT,
    "nssfNo"          TEXT,
    "shifNo"          TEXT,
    "bankDetails"     JSONB,
    "salaryStructure" JSONB            NOT NULL,
    "payFrequency"    TEXT             NOT NULL,
    "status"          "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- PayRun  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "PayRun" (
    "id"          TEXT           NOT NULL,
    "orgId"       TEXT           NOT NULL,
    "periodStart" TIMESTAMP(3)   NOT NULL,
    "periodEnd"   TIMESTAMP(3)   NOT NULL,
    "status"      "PayRunStatus" NOT NULL DEFAULT 'DRAFT',
    "totals"      JSONB          NOT NULL,
    CONSTRAINT "PayRun_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Payslip  (FK → PayRun, Employee)
-- ---------------------------------------------------------------------------

CREATE TABLE "Payslip" (
    "id"         TEXT          NOT NULL,
    "payRunId"   TEXT          NOT NULL,
    "employeeId" TEXT          NOT NULL,
    "earnings"   JSONB         NOT NULL,
    "deductions" JSONB         NOT NULL,
    "netPay"     DECIMAL(18,2) NOT NULL,
    "pdfUrl"     TEXT,
    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Project  (FK → Organization, Customer optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "Project" (
    "id"           TEXT            NOT NULL,
    "orgId"        TEXT            NOT NULL,
    "customerId"   TEXT,
    "name"         TEXT            NOT NULL,
    "budgetAmount" DECIMAL(18,2),
    "status"       "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate"    TIMESTAMP(3),
    "endDate"      TIMESTAMP(3),
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- TimeEntry  (FK → Organization, User, Project)
-- ---------------------------------------------------------------------------

CREATE TABLE "TimeEntry" (
    "id"              TEXT          NOT NULL,
    "orgId"           TEXT          NOT NULL,
    "userId"          TEXT          NOT NULL,
    "projectId"       TEXT          NOT NULL,
    "taskDescription" TEXT          NOT NULL,
    "date"            TIMESTAMP(3)  NOT NULL,
    "hours"           DECIMAL(8,2)  NOT NULL,
    "billable"        BOOLEAN       NOT NULL DEFAULT false,
    "hourlyRate"      DECIMAL(18,2),
    "invoiced"        BOOLEAN       NOT NULL DEFAULT false,
    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Budget  (FK → Organization, Account)
-- ---------------------------------------------------------------------------

CREATE TABLE "Budget" (
    "id"             TEXT     NOT NULL,
    "orgId"          TEXT     NOT NULL,
    "fiscalYear"     INTEGER  NOT NULL,
    "accountId"      TEXT     NOT NULL,
    "monthlyAmounts" JSONB    NOT NULL,
    CONSTRAINT "Budget_pkey"                         PRIMARY KEY ("id"),
    CONSTRAINT "Budget_orgId_fiscalYear_accountId_key" UNIQUE ("orgId", "fiscalYear", "accountId")
);

-- ---------------------------------------------------------------------------
-- AuditLogEntry  (FK → Organization, User optional)
-- ---------------------------------------------------------------------------

CREATE TABLE "AuditLogEntry" (
    "id"         TEXT         NOT NULL,
    "orgId"      TEXT         NOT NULL,
    "userId"     TEXT,
    "action"     TEXT         NOT NULL,
    "entityType" TEXT         NOT NULL,
    "entityId"   TEXT         NOT NULL,
    "diff"       JSONB        NOT NULL,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Attachment  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "Attachment" (
    "id"         TEXT         NOT NULL,
    "orgId"      TEXT         NOT NULL,
    "entityType" TEXT         NOT NULL,
    "entityId"   TEXT         NOT NULL,
    "fileUrl"    TEXT         NOT NULL,
    "uploadedBy" TEXT         NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Notification  (FK → Organization, User)
-- ---------------------------------------------------------------------------

CREATE TABLE "Notification" (
    "id"        TEXT         NOT NULL,
    "orgId"     TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "type"      TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "body"      TEXT         NOT NULL,
    "link"      TEXT,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- SavedReport  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "SavedReport" (
    "id"           TEXT     NOT NULL,
    "orgId"        TEXT     NOT NULL,
    "name"         TEXT     NOT NULL,
    "type"         TEXT     NOT NULL,
    "config"       JSONB    NOT NULL,
    "scheduleCron" TEXT,
    "recipients"   TEXT[]   NOT NULL DEFAULT ARRAY[]::TEXT[],
    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Integration  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "Integration" (
    "id"               TEXT                NOT NULL,
    "orgId"            TEXT                NOT NULL,
    "provider"         TEXT                NOT NULL,
    "status"           "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "configEncrypted"  JSONB               NOT NULL,
    "connectedAt"      TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Integration_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "Integration_orgId_provider_key" UNIQUE ("orgId", "provider")
);

-- ---------------------------------------------------------------------------
-- ExchangeRate  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "ExchangeRate" (
    "id"           TEXT          NOT NULL,
    "orgId"        TEXT          NOT NULL,
    "currencyCode" TEXT          NOT NULL,
    "rateToBase"   DECIMAL(18,8) NOT NULL,
    "asOfDate"     TIMESTAMP(3)  NOT NULL,
    CONSTRAINT "ExchangeRate_pkey"                         PRIMARY KEY ("id"),
    CONSTRAINT "ExchangeRate_orgId_currencyCode_asOfDate_key" UNIQUE ("orgId", "currencyCode", "asOfDate")
);

-- ---------------------------------------------------------------------------
-- WorkspaceRecord  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "WorkspaceRecord" (
    "id"        TEXT         NOT NULL,
    "orgId"     TEXT         NOT NULL,
    "moduleKey" TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "subtitle"  TEXT,
    "status"    TEXT,
    "amountMinor" INTEGER,
    "metadata"  JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkspaceRecord_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- ImportBatch  (FK → Organization)
-- ---------------------------------------------------------------------------

CREATE TABLE "ImportBatch" (
    "id"               TEXT         NOT NULL,
    "orgId"            TEXT         NOT NULL,
    "targetType"       TEXT         NOT NULL,
    "fileName"         TEXT         NOT NULL,
    "totalRows"        INTEGER      NOT NULL,
    "successRows"      INTEGER      NOT NULL,
    "failedRows"       INTEGER      NOT NULL,
    "status"           TEXT         NOT NULL,
    "createdRecordIds" JSONB        NOT NULL,
    "importedBy"       TEXT         NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedAt"       TIMESTAMP(3),
    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================================================

ALTER TABLE "User"
    ADD CONSTRAINT "User_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Role"
    ADD CONSTRAINT "Role_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrgMembership"
    ADD CONSTRAINT "OrgMembership_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "OrgMembership_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "OrgMembership_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Account"
    ADD CONSTRAINT "Account_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Account_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AccountingPeriod"
    ADD CONSTRAINT "AccountingPeriod_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JournalEntry"
    ADD CONSTRAINT "JournalEntry_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JournalLine"
    ADD CONSTRAINT "JournalLine_journalEntryId_fkey"
    FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "JournalLine_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BankConnection"
    ADD CONSTRAINT "BankConnection_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BankTransaction"
    ADD CONSTRAINT "BankTransaction_bankConnectionId_fkey"
    FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "BankTransaction_matchedJournalEntryId_fkey"
    FOREIGN KEY ("matchedJournalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BankRule"
    ADD CONSTRAINT "BankRule_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TaxRate"
    ADD CONSTRAINT "TaxRate_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Customer"
    ADD CONSTRAINT "Customer_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product"
    ADD CONSTRAINT "Product_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Product_incomeAccountId_fkey"
    FOREIGN KEY ("incomeAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Product_expenseAccountId_fkey"
    FOREIGN KEY ("expenseAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Product_taxRateId_fkey"
    FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Vendor"
    ADD CONSTRAINT "Vendor_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Invoice_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "InvoiceLine_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "InvoiceLine_taxRateId_fkey"
    FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Estimate"
    ADD CONSTRAINT "Estimate_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Estimate_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EstimateLine"
    ADD CONSTRAINT "EstimateLine_estimateId_fkey"
    FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "EstimateLine_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "EstimateLine_taxRateId_fkey"
    FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesReceipt"
    ADD CONSTRAINT "SalesReceipt_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "SalesReceipt_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesOrder"
    ADD CONSTRAINT "SalesOrder_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "SalesOrder_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentReceived"
    ADD CONSTRAINT "PaymentReceived_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "PaymentReceived_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "PaymentReceived_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecurringTemplate"
    ADD CONSTRAINT "RecurringTemplate_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Bill"
    ADD CONSTRAINT "Bill_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Bill_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BillLine"
    ADD CONSTRAINT "BillLine_billId_fkey"
    FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "BillLine_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "BillLine_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "BillLine_taxRateId_fkey"
    FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "BillLine_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Expense"
    ADD CONSTRAINT "Expense_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Expense_paymentAccountId_fkey"
    FOREIGN KEY ("paymentAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Expense_categoryAccountId_fkey"
    FOREIGN KEY ("categoryAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Expense_taxRateId_fkey"
    FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Expense_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "PurchaseOrder_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BillPayment"
    ADD CONSTRAINT "BillPayment_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "BillPayment_billId_fkey"
    FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TaxReturn"
    ADD CONSTRAINT "TaxReturn_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Employee"
    ADD CONSTRAINT "Employee_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PayRun"
    ADD CONSTRAINT "PayRun_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payslip"
    ADD CONSTRAINT "Payslip_payRunId_fkey"
    FOREIGN KEY ("payRunId") REFERENCES "PayRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "Payslip_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Project"
    ADD CONSTRAINT "Project_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Project_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TimeEntry"
    ADD CONSTRAINT "TimeEntry_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "TimeEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "TimeEntry_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Budget"
    ADD CONSTRAINT "Budget_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Budget_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditLogEntry"
    ADD CONSTRAINT "AuditLogEntry_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "AuditLogEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Attachment"
    ADD CONSTRAINT "Attachment_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SavedReport"
    ADD CONSTRAINT "SavedReport_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Integration"
    ADD CONSTRAINT "Integration_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ExchangeRate"
    ADD CONSTRAINT "ExchangeRate_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkspaceRecord"
    ADD CONSTRAINT "WorkspaceRecord_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ImportBatch"
    ADD CONSTRAINT "ImportBatch_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX "OrgMembership_orgId_idx"  ON "OrgMembership"("orgId");
CREATE INDEX "OrgMembership_roleId_idx" ON "OrgMembership"("roleId");

CREATE INDEX "Account_orgId_type_idx" ON "Account"("orgId", "type");

CREATE INDEX "JournalEntry_orgId_entryDate_idx"              ON "JournalEntry"("orgId", "entryDate");
CREATE INDEX "JournalEntry_orgId_sourceType_sourceId_idx"    ON "JournalEntry"("orgId", "sourceType", "sourceId");

CREATE INDEX "JournalLine_accountId_idx"          ON "JournalLine"("accountId");
CREATE INDEX "JournalLine_entityType_entityId_idx" ON "JournalLine"("entityType", "entityId");

CREATE INDEX "BankConnection_orgId_idx" ON "BankConnection"("orgId");

CREATE INDEX "BankTransaction_bankConnectionId_date_idx"  ON "BankTransaction"("bankConnectionId", "date");
CREATE INDEX "BankTransaction_matchedJournalEntryId_idx"  ON "BankTransaction"("matchedJournalEntryId");

CREATE INDEX "BankRule_orgId_priority_idx" ON "BankRule"("orgId", "priority");

CREATE INDEX "TaxRate_orgId_jurisdiction_idx" ON "TaxRate"("orgId", "jurisdiction");

CREATE INDEX "Customer_orgId_displayName_idx" ON "Customer"("orgId", "displayName");

CREATE INDEX "Product_orgId_type_idx" ON "Product"("orgId", "type");

CREATE INDEX "Vendor_orgId_displayName_idx" ON "Vendor"("orgId", "displayName");

CREATE INDEX "Invoice_orgId_status_dueDate_idx" ON "Invoice"("orgId", "status", "dueDate");

CREATE INDEX "PaymentReceived_orgId_date_idx" ON "PaymentReceived"("orgId", "date");

CREATE INDEX "Bill_orgId_status_dueDate_idx" ON "Bill"("orgId", "status", "dueDate");

CREATE INDEX "Expense_orgId_date_idx" ON "Expense"("orgId", "date");

CREATE INDEX "Employee_orgId_name_idx" ON "Employee"("orgId", "name");

CREATE INDEX "PayRun_orgId_periodStart_periodEnd_idx" ON "PayRun"("orgId", "periodStart", "periodEnd");

CREATE INDEX "Project_orgId_status_idx" ON "Project"("orgId", "status");

CREATE INDEX "TimeEntry_orgId_date_idx" ON "TimeEntry"("orgId", "date");

CREATE INDEX "AuditLogEntry_orgId_createdAt_idx"  ON "AuditLogEntry"("orgId", "createdAt");
CREATE INDEX "AuditLogEntry_entityType_entityId_idx" ON "AuditLogEntry"("entityType", "entityId");

CREATE INDEX "Attachment_orgId_entityType_entityId_idx" ON "Attachment"("orgId", "entityType", "entityId");

CREATE INDEX "Notification_orgId_userId_readAt_idx" ON "Notification"("orgId", "userId", "readAt");

CREATE INDEX "WorkspaceRecord_orgId_moduleKey_createdAt_idx" ON "WorkspaceRecord"("orgId", "moduleKey", "createdAt");

CREATE INDEX "ImportBatch_orgId_targetType_createdAt_idx" ON "ImportBatch"("orgId", "targetType", "createdAt");

-- =============================================================================
-- DOUBLE-ENTRY GUARDRAILS
-- =============================================================================

ALTER TABLE "JournalLine"
    ADD CONSTRAINT "journal_line_non_negative_amounts"
    CHECK ("debit" >= 0 AND "credit" >= 0);

ALTER TABLE "JournalLine"
    ADD CONSTRAINT "journal_line_one_sided_amount"
    CHECK (("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0));

CREATE OR REPLACE FUNCTION enforce_balanced_journal_entry()
RETURNS trigger AS $$
DECLARE
  affected_entry_id text;
  debit_total numeric;
  credit_total numeric;
  line_count integer;
BEGIN
  affected_entry_id := COALESCE(NEW."journalEntryId", OLD."journalEntryId");

  SELECT
    COALESCE(SUM("debit"), 0),
    COALESCE(SUM("credit"), 0),
    COUNT(*)
  INTO debit_total, credit_total, line_count
  FROM "JournalLine"
  WHERE "journalEntryId" = affected_entry_id;

  IF line_count < 2 THEN
    RAISE EXCEPTION 'JournalEntry % must have at least two lines', affected_entry_id;
  END IF;

  IF debit_total <> credit_total THEN
    RAISE EXCEPTION 'JournalEntry % is unbalanced: debit % credit %', affected_entry_id, debit_total, credit_total;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "journal_entry_balance_check"
AFTER INSERT OR UPDATE OR DELETE ON "JournalLine"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION enforce_balanced_journal_entry();
