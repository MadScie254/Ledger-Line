export interface ModuleDefinition {
  moduleKey: string;
  title: string;
  description: string;
  createLabel: string;
  status?: "wip" | "coming_soon";
}

export const moduleDefinitions = {

  "banking-rules": {
    moduleKey: "banking-rules",
    title: "Bank rules",
    description: "Rules used to categorize and tag bank feed activity.",
    createLabel: "Add rule",
    status: "coming_soon"
  },
  "banking-reconcile": {
    moduleKey: "banking-reconcile",
    title: "Reconcile",
    description: "Statement reconciliation sessions and notes.",
    createLabel: "Start reconciliation"
  },
  "banking-connections": {
    moduleKey: "banking-connections",
    title: "Bank connections",
    description: "Connected bank and mobile-money channels.",
    createLabel: "Connect bank"
  },
  "sales-overview": {
    moduleKey: "sales-overview",
    title: "Sales overview",
    description: "Pinned sales snapshots and operational notes.",
    createLabel: "Add note"
  },
  "sales-customers": {
    moduleKey: "sales-customers",
    title: "Customers",
    description: "Customer records used in sales workflows.",
    createLabel: "Create customer"
  },
  "sales-invoices": {
    moduleKey: "sales-invoices",
    title: "Invoices",
    description: "Invoice drafts and posted invoice records.",
    createLabel: "Create invoice",
    status: "wip"
  },
  "sales-estimates": {
    moduleKey: "sales-estimates",
    title: "Estimates",
    description: "Sales estimates and quote drafts.",
    createLabel: "Create estimate"
  },
  "sales-sales-receipts": {
    moduleKey: "sales-sales-receipts",
    title: "Sales receipts",
    description: "Immediate sale receipts and collection records.",
    createLabel: "Create receipt"
  },
  "sales-sales-orders": {
    moduleKey: "sales-sales-orders",
    title: "Sales orders",
    description: "Order requests before invoicing.",
    createLabel: "Create order"
  },
  "sales-recurring": {
    moduleKey: "sales-recurring",
    title: "Recurring transactions",
    description: "Recurring billing templates and schedules.",
    createLabel: "Create recurring"
  },
  "sales-products-services": {
    moduleKey: "sales-products-services",
    title: "Products and services",
    description: "Items and services sold to customers.",
    createLabel: "Create item"
  },
  "sales-payments-received": {
    moduleKey: "sales-payments-received",
    title: "Payments received",
    description: "Customer payment receipts and allocations.",
    createLabel: "Record payment"
  },
  "expenses-vendors": {
    moduleKey: "expenses-vendors",
    title: "Vendors",
    description: "Supplier records used for bills and expenses.",
    createLabel: "Create vendor"
  },
  "expenses-bills": {
    moduleKey: "expenses-bills",
    title: "Bills",
    description: "Open and paid bills from suppliers.",
    createLabel: "Create bill"
  },
  "expenses-expenses": {
    moduleKey: "expenses-expenses",
    title: "Expenses",
    description: "Cash and card spending records.",
    createLabel: "Create expense"
  },
  "expenses-purchase-orders": {
    moduleKey: "expenses-purchase-orders",
    title: "Purchase orders",
    description: "Purchase orders sent to vendors.",
    createLabel: "Create purchase order"
  },
  "expenses-bill-payments": {
    moduleKey: "expenses-bill-payments",
    title: "Bill payments",
    description: "Payments applied against one or more bills.",
    createLabel: "Create bill payment"
  },
  "accounting-journal-entries": {
    moduleKey: "accounting-journal-entries",
    title: "Journal entries",
    description: "Manual and imported accounting entries.",
    createLabel: "Create entry"
  },
  "accounting-reconciliation-history": {
    moduleKey: "accounting-reconciliation-history",
    title: "Reconciliation history",
    description: "Completed and open reconciliation events.",
    createLabel: "Add reconciliation"
  },
  "accounting-close-books": {
    moduleKey: "accounting-close-books",
    title: "Close books",
    description: "Close-book checkpoints and period lock notes.",
    createLabel: "Add close note"
  },
  "payroll-employees": {
    moduleKey: "payroll-employees",
    title: "Employees",
    description: "Payroll employee master records.",
    createLabel: "Create employee"
  },
  "payroll-run": {
    moduleKey: "payroll-run",
    title: "Run payroll",
    description: "Payroll run batches by period.",
    createLabel: "Start pay run"
  },
  "payroll-payslips": {
    moduleKey: "payroll-payslips",
    title: "Payslips",
    description: "Generated payslip records.",
    createLabel: "Create payslip"
  },
  "payroll-filings": {
    moduleKey: "payroll-filings",
    title: "Statutory filings",
    description: "Payroll-related statutory filing records.",
    createLabel: "Create filing"
  },
  "tax-center": {
    moduleKey: "tax-center",
    title: "Tax center",
    description: "Tax workflow snapshots and filing statuses.",
    createLabel: "Add tax item"
  },
  "tax-etims": {
    moduleKey: "tax-etims",
    title: "eTIMS",
    description: "KRA eTIMS integration and submission records.",
    createLabel: "Create eTIMS task"
  },
  "tax-filing-calendar": {
    moduleKey: "tax-filing-calendar",
    title: "Filing calendar",
    description: "Upcoming and completed filing calendar events.",
    createLabel: "Add calendar event"
  },
  "inventory-items": {
    moduleKey: "inventory-items",
    title: "Inventory items",
    description: "Stocked and non-stocked item records.",
    createLabel: "Create item"
  },
  "inventory-adjustments": {
    moduleKey: "inventory-adjustments",
    title: "Inventory adjustments",
    description: "Quantity and valuation adjustment records.",
    createLabel: "Create adjustment"
  },
  "inventory-reorder-alerts": {
    moduleKey: "inventory-reorder-alerts",
    title: "Reorder alerts",
    description: "Low-stock signals and follow-up actions.",
    createLabel: "Create alert"
  },
  projects: {
    moduleKey: "projects",
    title: "Projects",
    description: "Project records for job costing and tracking.",
    createLabel: "Create project"
  },
  "projects-detail": {
    moduleKey: "projects-detail",
    title: "Project detail",
    description: "Project-level activity and delivery notes.",
    createLabel: "Add project note"
  },
  "projects-time-tracking": {
    moduleKey: "projects-time-tracking",
    title: "Time tracking",
    description: "Time entries and billable hour notes.",
    createLabel: "Create time entry"
  },
  "customer-hub-leads": {
    moduleKey: "customer-hub-leads",
    title: "Leads",
    description: "Prospective customer leads.",
    createLabel: "Create lead"
  },
  "customer-hub-follow-ups": {
    moduleKey: "customer-hub-follow-ups",
    title: "Follow-ups",
    description: "Customer follow-up activities and reminders.",
    createLabel: "Create follow-up"
  },
  "customer-hub-customer-360": {
    moduleKey: "customer-hub-customer-360",
    title: "Customer 360",
    description: "Customer-specific activity and lifecycle notes.",
    createLabel: "Add customer note"
  },
  reports: {
    moduleKey: "reports",
    title: "Reports",
    description: "Standard reports and saved report views.",
    createLabel: "Create report"
  },
  "reports-profit-and-loss": {
    moduleKey: "reports-profit-and-loss",
    title: "Profit and loss",
    description: "Saved P&L report variants.",
    createLabel: "Create view"
  },
  "reports-ar-aging": {
    moduleKey: "reports-ar-aging",
    title: "A/R aging",
    description: "Saved accounts receivable aging variants.",
    createLabel: "Create view"
  },
  "reports-ap-aging": {
    moduleKey: "reports-ap-aging",
    title: "A/P aging",
    description: "Saved accounts payable aging variants.",
    createLabel: "Create view"
  },

  "team-accountant-access": {
    moduleKey: "team-accountant-access",
    title: "Accountant access",
    description: "External accountant access links and permissions.",
    createLabel: "Grant access"
  },
  integrations: {
    moduleKey: "integrations",
    title: "Integrations",
    description: "Connected apps and integration tasks.",
    createLabel: "Connect app"
  },
  "business-feed": {
    moduleKey: "business-feed",
    title: "Business Feed",
    description: "Operational signals and insight events.",
    createLabel: "Add insight"
  },
  "settings-company": {
    moduleKey: "settings-company",
    title: "Company profile",
    description: "Company setup and policy records.",
    createLabel: "Add profile item"
  },
  "settings-currencies": {
    moduleKey: "settings-currencies",
    title: "Currencies",
    description: "Currency management records and rates.",
    createLabel: "Add currency"
  },
  "settings-tax": {
    moduleKey: "settings-tax",
    title: "Tax settings",
    description: "Tax setup tasks and configuration notes.",
    createLabel: "Add tax setting"
  },
  "settings-templates": {
    moduleKey: "settings-templates",
    title: "Templates",
    description: "Document and workflow templates.",
    createLabel: "Create template"
  },
  "settings-audit-log": {
    moduleKey: "settings-audit-log",
    title: "Audit log",
    description: "Cross-module audit and traceability records.",
    createLabel: "Add audit note"
  },
  "settings-billing": {
    moduleKey: "settings-billing",
    title: "Billing",
    description: "Subscription and billing operations notes.",
    createLabel: "Add billing item"
  },
  "settings-import": {
    moduleKey: "settings-import",
    title: "Universal importer",
    description: "Import batch validation and commit history.",
    createLabel: "Create import batch"
  },
  notifications: {
    moduleKey: "notifications",
    title: "Notifications",
    description: "Operational notifications and reminders.",
    createLabel: "Create notification"
  },
  catalog: {
    moduleKey: "catalog",
    title: "Component catalog",
    description: "UI catalog notes and examples.",
    createLabel: "Add catalog entry"
  }
} satisfies Record<string, ModuleDefinition>;

export type ModuleKey = keyof typeof moduleDefinitions;

export function getModuleDefinition(moduleKey: string) {
  return moduleDefinitions[moduleKey as ModuleKey] ?? null;
}
