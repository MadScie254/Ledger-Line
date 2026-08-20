import { RolesWorkspace } from "@/components/roles-workspace";

export const metadata = {
  title: "Roles & Permissions | LedgerLine"
};

export default function RolesPage() {
  return <RolesWorkspace initialTab="roles" />;
}
