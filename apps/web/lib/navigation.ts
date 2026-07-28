import {
  BadgeDollarSign,
  Banknote,
  BellRing,
  BookOpenCheck,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  FileBarChart2,
  FileCheck2,
  HandCoins,
  Home,
  Landmark,
  Network,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  {
    title: "Banking",
    href: "/banking/transactions",
    icon: Landmark,
    children: [
      { title: "Bank transactions", href: "/banking/transactions" },
      { title: "Rules", href: "/banking/rules" },
      { title: "Reconcile", href: "/banking/reconcile" },
      { title: "Bank connections", href: "/banking/connections" }
    ]
  },
  {
    title: "Sales",
    href: "/sales/overview",
    icon: ReceiptText,
    children: [
      { title: "Overview", href: "/sales/overview" },
      { title: "Customers", href: "/sales/customers" },
      { title: "Invoices", href: "/sales/invoices" },
      { title: "Estimates", href: "/sales/estimates" },
      { title: "Sales receipts", href: "/sales/sales-receipts" },
      { title: "Sales orders", href: "/sales/sales-orders" },
      { title: "Recurring transactions", href: "/sales/recurring" },
      { title: "Products & services", href: "/sales/products-services" },
      { title: "Payments received", href: "/sales/payments-received" }
    ]
  },
  {
    title: "Expenses & Bills",
    href: "/expenses/vendors",
    icon: WalletCards,
    children: [
      { title: "Vendors", href: "/expenses/vendors" },
      { title: "Bills", href: "/expenses/bills" },
      { title: "Expenses", href: "/expenses/expenses" },
      { title: "Purchase orders", href: "/expenses/purchase-orders" },
      { title: "Bill payments", href: "/expenses/bill-payments" }
    ]
  },
  {
    title: "Accounting",
    href: "/accounting/chart-of-accounts",
    icon: BookOpenCheck,
    children: [
      { title: "Chart of accounts", href: "/accounting/chart-of-accounts" },
      { title: "Journal entries", href: "/accounting/journal-entries" },
      { title: "Reconciliation history", href: "/accounting/reconciliation-history" },
      { title: "Close the books", href: "/accounting/close-books" }
    ]
  },
  {
    title: "Payroll",
    href: "/payroll/employees",
    icon: HandCoins,
    children: [
      { title: "Employees", href: "/payroll/employees" },
      { title: "Run payroll", href: "/payroll/run" },
      { title: "Payslips", href: "/payroll/payslips" },
      { title: "Statutory filings", href: "/payroll/filings" }
    ]
  },
  {
    title: "Tax",
    href: "/tax/center",
    icon: Scale,
    children: [
      { title: "VAT/tax center", href: "/tax/center" },
      { title: "eTIMS / KRA bridge", href: "/tax/etims" },
      { title: "Filing calendar", href: "/tax/filing-calendar" }
    ]
  },
  {
    title: "Inventory",
    href: "/inventory/items",
    icon: Boxes,
    children: [
      { title: "Items", href: "/inventory/items" },
      { title: "Stock adjustments", href: "/inventory/adjustments" },
      { title: "Reorder alerts", href: "/inventory/reorder-alerts" }
    ]
  },
  {
    title: "Projects",
    href: "/projects",
    icon: BriefcaseBusiness,
    children: [
      { title: "Project list", href: "/projects" },
      { title: "Project detail", href: "/projects/demo-project" },
      { title: "Time tracking", href: "/projects/time-tracking" }
    ]
  },
  {
    title: "Customer Hub",
    href: "/customer-hub/leads",
    icon: UsersRound,
    children: [
      { title: "Leads", href: "/customer-hub/leads" },
      { title: "Follow-ups", href: "/customer-hub/follow-ups" },
      { title: "Customer 360", href: "/customer-hub/demo-customer" }
    ]
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
    children: [
      { title: "Profit and loss", href: "/reports/profit-and-loss" },
      { title: "Balance sheet", href: "/reports/balance-sheet" },
      { title: "Cash flow", href: "/reports/cash-flow" },
      { title: "Trial balance", href: "/reports/trial-balance" },
      { title: "A/R aging", href: "/reports/ar-aging" },
      { title: "A/P aging", href: "/reports/ap-aging" }
    ]
  },
  {
    title: "Team",
    href: "/team/users",
    icon: ShieldCheck,
    children: [
      { title: "Users", href: "/team/users" },
      { title: "Roles", href: "/team/roles" },
      { title: "Accountant access", href: "/team/accountant-access" }
    ]
  },
  { title: "Apps / Integrations", href: "/integrations", icon: Network },
  { title: "Business Feed", href: "/business-feed", icon: Sparkles },
  {
    title: "Settings",
    href: "/settings/company",
    icon: Settings,
    children: [
      { title: "Company profile", href: "/settings/company" },
      { title: "Currencies", href: "/settings/currencies" },
      { title: "Tax settings", href: "/settings/tax" },
      { title: "Templates", href: "/settings/templates" },
      { title: "Audit log", href: "/settings/audit-log" },
      { title: "Billing", href: "/settings/billing" },
      { title: "Import", href: "/settings/import" },
      { title: "Component catalog", href: "/catalog" }
    ]
  }
];

export const quickActions = [
  { title: "New invoice", href: "/sales/invoices", icon: BadgeDollarSign },
  { title: "Record expense", href: "/expenses/expenses", icon: CircleDollarSign },
  { title: "Post journal", href: "/accounting/journal-entries", icon: FileCheck2 },
  { title: "Connect bank", href: "/banking/connections", icon: Banknote },
  { title: "Company setup", href: "/settings/company", icon: Building2 },
  { title: "Notifications", href: "/notifications", icon: BellRing },
  { title: "Reports", href: "/reports", icon: ChartNoAxesCombined },
  { title: "Time", href: "/projects/time-tracking", icon: Clock3 }
];

export function findNavigationTitle(pathname: string) {
  const items = navigation.flatMap((item) => [item, ...(item.children ?? [])]);
  return items.find((item) => item.href === pathname)?.title ?? titleFromPath(pathname);
}

export function titleFromPath(pathname: string) {
  const last = pathname.split("/").filter(Boolean).at(-1) ?? "Home";
  return last
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
