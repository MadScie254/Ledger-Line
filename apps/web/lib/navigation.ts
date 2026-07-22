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
    href: "/banking",
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
    href: "/sales",
    icon: ReceiptText,
    children: [
      { title: "Overview", href: "/sales" },
      { title: "Customers", href: "/sales/customers" },
      { title: "Invoices", href: "/sales/invoices" },
      { title: "Estimates", href: "/sales/estimates" },
      { title: "Sales receipts", href: "/sales/receipts" },
      { title: "Sales orders", href: "/sales/orders" },
      { title: "Recurring transactions", href: "/sales/recurring" },
      { title: "Products & services", href: "/sales/products" },
      { title: "Payments received", href: "/sales/payments" }
    ]
  },
  {
    title: "Expenses & Bills",
    href: "/expenses",
    icon: WalletCards,
    children: [
      { title: "Vendors", href: "/expenses/vendors" },
      { title: "Bills", href: "/expenses/bills" },
      { title: "Expenses", href: "/expenses/expenses" },
      { title: "Purchase orders", href: "/expenses/purchase-orders" },
      { title: "Bill payments", href: "/expenses/payments" }
    ]
  },
  {
    title: "Accounting",
    href: "/accounting",
    icon: BookOpenCheck,
    children: [
      { title: "Chart of accounts", href: "/accounting/chart-of-accounts" },
      { title: "Journal entries", href: "/accounting/journal-entries" },
      { title: "Reconciliation history", href: "/accounting/reconciliation-history" },
      { title: "Close the books", href: "/accounting/close" }
    ]
  },
  {
    title: "Payroll",
    href: "/payroll",
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
    href: "/tax",
    icon: Scale,
    children: [
      { title: "VAT/tax center", href: "/tax/vat" },
      { title: "eTIMS / KRA bridge", href: "/tax/etims" },
      { title: "Filing calendar", href: "/tax/calendar" }
    ]
  },
  {
    title: "Inventory",
    href: "/inventory",
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
      { title: "Project list", href: "/projects/list" },
      { title: "Job costing", href: "/projects/job-costing" },
      { title: "Time tracking", href: "/projects/time" }
    ]
  },
  {
    title: "Customer Hub",
    href: "/customer-hub",
    icon: UsersRound,
    children: [
      { title: "Leads", href: "/customer-hub/leads" },
      { title: "Follow-ups", href: "/customer-hub/follow-ups" },
      { title: "Customer 360", href: "/customer-hub/360" }
    ]
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
    children: [
      { title: "Standard reports", href: "/reports/standard" },
      { title: "Custom builder", href: "/reports/builder" },
      { title: "Management packs", href: "/reports/management-packs" },
      { title: "Scheduled reports", href: "/reports/scheduled" }
    ]
  },
  {
    title: "Team",
    href: "/team",
    icon: ShieldCheck,
    children: [
      { title: "Users & roles", href: "/team/users" },
      { title: "Accountant access", href: "/team/accountant-access" }
    ]
  },
  { title: "Apps / Integrations", href: "/integrations", icon: Network },
  { title: "Business Feed", href: "/business-feed", icon: Sparkles },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { title: "Company profile", href: "/settings/company" },
      { title: "Currencies", href: "/settings/currencies" },
      { title: "Tax settings", href: "/settings/tax" },
      { title: "Templates", href: "/settings/templates" },
      { title: "Audit log", href: "/settings/audit-log" },
      { title: "Billing", href: "/settings/billing" },
      { title: "Component catalog", href: "/catalog" }
    ]
  }
];

export const quickActions = [
  { title: "New invoice", href: "/sales/invoices/new", icon: BadgeDollarSign },
  { title: "Record expense", href: "/expenses/expenses/new", icon: CircleDollarSign },
  { title: "Post journal", href: "/accounting/journal-entries/new", icon: FileCheck2 },
  { title: "Connect bank", href: "/banking/connections", icon: Banknote },
  { title: "Company setup", href: "/settings/company", icon: Building2 },
  { title: "Notifications", href: "/notifications", icon: BellRing },
  { title: "Reports", href: "/reports/standard", icon: ChartNoAxesCombined },
  { title: "Time", href: "/projects/time", icon: Clock3 }
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
