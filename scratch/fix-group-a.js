const fs = require('fs');
const path = require('path');

const mappings = {
  'sales/sales-orders': { icon: 'FileText', title: 'Sales orders', desc: 'Track and manage sales orders before invoicing.', action: 'Create Sales Order' },
  'sales/sales-receipts': { icon: 'Receipt', title: 'Sales receipts', desc: 'Record immediate payment and sales.', action: 'Create Receipt' },
  'sales/recurring': { icon: 'Repeat', title: 'Recurring transactions', desc: 'Manage repeating bills and invoices.', action: 'Create Recurring Transaction' },
  'projects': { icon: 'FolderOpen', title: 'Projects', desc: 'Organize work and track profitability by project.', action: 'Create Project' },
  'projects/time-tracking': { icon: 'Clock', title: 'Time tracking', desc: 'Log billable hours against projects.', action: 'Create Time Entry' },
  'expenses/purchase-orders': { icon: 'ShoppingCart', title: 'Purchase orders', desc: 'Send POs to your vendors.', action: 'Create Purchase Order' },
  'tax/filing-calendar': { icon: 'CalendarDays', title: 'Filing calendar', desc: 'Track upcoming tax deadlines.', action: 'Add Calendar Event' },
  'settings/tax': { icon: 'Percent', title: 'Tax settings', desc: 'Configure default tax rates and agencies.', action: 'Add Tax Setting' },
  'settings/currencies': { icon: 'Coins', title: 'Currencies', desc: 'Manage exchange rates and base currencies.', action: 'Add Currency' },
};

const baseDir = path.join(__dirname, '../apps/web/app/(app)');

for (const [route, config] of Object.entries(mappings)) {
  const pagePath = path.join(baseDir, route, 'page.tsx');
  const content = `"use client";
  
import { ${config.icon}, Plus } from "lucide-react";
import { Button, DoubleRule, EmptyState } from "@ledgerline/ui";

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
        title="No records found"
        body="This section is currently empty. Get started by creating your first record."
        action={
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            ${config.action}
          </Button>
        }
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
