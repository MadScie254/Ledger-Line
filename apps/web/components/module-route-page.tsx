import { notFound } from "next/navigation";
import { WorkspaceRecordsWorkspace } from "@/components/workspace-records-workspace";
import { getModuleDefinition } from "@/lib/module-registry";

export function ModuleRoutePage({ moduleKey }: { moduleKey: string }) {
  const definition = getModuleDefinition(moduleKey);

  if (!definition) {
    notFound();
  }

  return <WorkspaceRecordsWorkspace definition={definition} />;
}
