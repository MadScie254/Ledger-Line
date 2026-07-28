import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Payments received"
      description="Record customer payments and auto-apply journal postings to receivables."
      createLabel="Record payment"
      endpoint="/api/entities/payments"
      fields={[
      { key: 'title', label: 'Reference', required: true },
      { key: 'subtitle', label: 'Customer name', required: true },
      { key: 'amountMinor', label: 'Amount (minor units)', type: 'number', required: true },
      { key: 'paymentDate', label: 'Payment date', type: 'date' },
      { key: 'method', label: 'Method', placeholder: 'bank' },
      { key: 'invoiceNo', label: 'Invoice number (optional)' },
      { key: 'depositAccountCode', label: 'Deposit account code', placeholder: '1000' }
      ]}
    />
  );
}
