import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Expenses"
      description="Create posted expenses with direct debit-credit journal impact."
      createLabel="Create expense"
      endpoint="/api/entities/expenses"
      fields={[
      { key: 'title', label: 'Payee', required: true },
      { key: 'amountMinor', label: 'Amount (minor units)', type: 'number', required: true },
      { key: 'expenseDate', label: 'Expense date', type: 'date' },
      { key: 'categoryAccountCode', label: 'Category account code', placeholder: '6300' },
      { key: 'paymentAccountCode', label: 'Payment account code', placeholder: '1000' },
      { key: 'subtitle', label: 'Receipt URL' }
      ]}
    />
  );
}
