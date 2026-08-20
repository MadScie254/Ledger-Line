const fs = require('fs');
const path = require('path');

const mappings = {
  'sales/overview': { icon: 'LayoutDashboard', title: 'Sales overview', desc: 'Pinned sales snapshots and operational notes.', action: null },
  'settings/billing': { icon: 'CreditCard', title: 'Billing', desc: 'Subscription and billing operations notes.', action: null },
  'settings/templates': { icon: 'LayoutTemplate', title: 'Templates', desc: 'Document and workflow templates.', action: null },
  'tax/center': { icon: 'Landmark', title: 'Tax center', desc: 'Tax workflow snapshots and filing statuses.', action: null },
  'tax/etims': { icon: 'FileCheck', title: 'eTIMS', desc: 'KRA eTIMS integration and submission records.', action: null },
  'team/accountant-access': { icon: 'Users', title: 'Accountant access', desc: 'External accountant access links and permissions.', action: null },
  'inventory/adjustments': { icon: 'SlidersHorizontal', title: 'Inventory adjustments', desc: 'Quantity and valuation adjustment records.', action: null },
  'inventory/reorder-alerts': { icon: 'BellRing', title: 'Reorder alerts', desc: 'Low-stock signals and follow-up actions.', action: null },
  'integrations': { icon: 'Blocks', title: 'Integrations', desc: 'Connected apps and integration tasks.', action: null },
  'payroll/filings': { icon: 'FileSpreadsheet', title: 'Statutory filings', desc: 'Payroll-related statutory filing records.', action: null },
  'notifications': { icon: 'Bell', title: 'Notifications', desc: 'Operational notifications and reminders.', action: null },
  'projects/[id]': { icon: 'FolderKanban', title: 'Project detail', desc: 'Project-level activity and delivery notes.', action: null },
  'customer-hub/leads': { icon: 'Target', title: 'Leads', desc: 'Prospective customer leads.', action: null },
  'customer-hub/[customerId]': { icon: 'UserCircle', title: 'Customer 360', desc: 'Customer-specific activity and lifecycle notes.', action: null },
  'customer-hub/follow-ups': { icon: 'MessageSquare', title: 'Follow-ups', desc: 'Customer follow-up activities and reminders.', action: null },
  'accounting/reconciliation-history': { icon: 'History', title: 'Reconciliation history', desc: 'Completed and open reconciliation events.', action: null },
};

const baseDir = path.join(__dirname, '../apps/web/app/(app)');

for (const [route, config] of Object.entries(mappings)) {
  const pagePath = path.join(baseDir, route, 'page.tsx');
  const content = `"use client";
  
import { ${config.icon} } from "lucide-react";
import { DoubleRule, EmptyState } from "@ledgerline/ui";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900">${config.title}</h1>
            <p className="mt-3 text-sm text-slate-500">${config.desc}</p>
          </div>
        </div>
        <DoubleRule className="mt-5" />
      </header>
      
      <EmptyState
        icon={<${config.icon} className="h-5 w-5" />}
        title="Nothing to show"
        body="There is currently no data available for this view."
      />
    </div>
  );
}
`;
  if (fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`Updated ${route}/page.tsx`);
  } else {
    console.log(`Missing ${route}/page.tsx`);
  }
}
