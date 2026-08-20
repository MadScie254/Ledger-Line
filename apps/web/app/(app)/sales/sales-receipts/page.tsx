import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Sales Receipts"
      description="Record immediate cash sales that post directly to revenue and deposit accounts."
      createLabel="Create receipt"
      endpoint="/api/entities/sales-receipts"
      fields={[
        { key: "subtitle", label: "Customer name (optional)" },
        { key: "paymentMethod", label: "Payment method (cash / mpesa / card)" },
        { key: "date", label: "Receipt date", type: "date" },
      ]}
    />
  );
}
