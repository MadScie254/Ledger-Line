import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Inventory items"
      description="Stocked and non-stocked products with on-hand quantities."
      createLabel="Create item"
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
