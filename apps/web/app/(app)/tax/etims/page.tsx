import { SimpleEntityWorkspace } from "@/components/simple-entity-workspace";

export default function Page() {
  return (
    <SimpleEntityWorkspace
      entity="etims-logs"
      title="eTIMS Bridge Logs"
      subtitle="Track your invoice and receipt transmissions to KRA eTIMS."
      actionLabel=""
      fields={[]}
    />
  );
}
