import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Invoices"
      description="Create invoices that post to A/R through ledger rules."
      createLabel="Create invoice"
      endpoint="/api/entities/invoices"
      fields={[
      { key: 'title', label: 'Invoice number', required: true },
      { key: 'subtitle', label: 'Customer name', required: true },
      { key: 'amountMinor', label: 'Total (minor units)', type: 'number', required: true },
      { key: 'issueDate', label: 'Issue date', type: 'date' },
      { key: 'dueDate', label: 'Due date', type: 'date' }
      ]}
    />
  );
}
