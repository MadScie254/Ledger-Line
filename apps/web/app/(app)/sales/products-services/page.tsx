import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Products and services"
      description="Catalog of sellable products and services."
      createLabel="Create product"
      endpoint="/api/entities/items"
      fields={[
      { key: 'title', label: 'Item name', required: true },
      { key: 'subtitle', label: 'SKU' },
      { key: 'amountMinor', label: 'Sales price (minor units)', type: 'number' },
      { key: 'costMinor', label: 'Cost (minor units)', type: 'number' },
      { key: 'qtyOnHand', label: 'Quantity on hand', type: 'number' }
      ]}
    />
  );
}
