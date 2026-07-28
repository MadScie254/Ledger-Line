import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Bills"
      description="Create vendor bills that post to A/P through ledger rules."
      createLabel="Create bill"
      endpoint="/api/entities/bills"
      fields={[
      { key: 'title', label: 'Bill number', required: true },
      { key: 'subtitle', label: 'Vendor name', required: true },
      { key: 'amountMinor', label: 'Total (minor units)', type: 'number', required: true },
      { key: 'billDate', label: 'Bill date', type: 'date' },
      { key: 'dueDate', label: 'Due date', type: 'date' },
      { key: 'categoryAccountCode', label: 'Expense account code', placeholder: '5000' }
      ]}
    />
  );
}
