import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Customers"
      description="Customer records used in sales workflows."
      createLabel="Create customer"
      endpoint="/api/entities/customers"
      fields={[
      { key: 'title', label: 'Customer name', required: true },
      { key: 'subtitle', label: 'Company name' },
      { key: 'email', label: 'Primary email' },
      { key: 'phone', label: 'Primary phone' }
      ]}
    />
  );
}
