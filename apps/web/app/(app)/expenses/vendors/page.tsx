import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Vendors"
      description="Supplier records used for bills and expenses."
      createLabel="Create vendor"
      endpoint="/api/entities/vendors"
      fields={[
      { key: 'title', label: 'Vendor name', required: true },
      { key: 'subtitle', label: 'Category' },
      { key: 'email', label: 'Primary email' },
      { key: 'phone', label: 'Primary phone' }
      ]}
    />
  );
}
