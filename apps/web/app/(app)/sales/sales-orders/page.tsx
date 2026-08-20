"use client";
  
import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="Sales Orders"
      description="Track sales orders before they are converted to invoices. Each order can be fulfilled and invoiced separately."
      createLabel="Create order"
      endpoint="/api/entities/sales-orders"
      fields={[
        { key: "subtitle", label: "Customer name" },
        { key: "status", label: "Status (DRAFT / CONFIRMED)" },
      ]}
    />
  );
}
