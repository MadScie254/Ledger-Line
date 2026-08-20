import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      title="eTIMS Bridge Logs"
      description="Track your invoice and receipt transmissions to KRA eTIMS."
      createLabel="New Log"
      endpoint="/api/entities/etims-logs"
      fields={[]}
    />
  );
}
