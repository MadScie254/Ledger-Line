import { RolesWorkspace } from "@/components/roles-workspace";

export const metadata = {
  title: "Users | LedgerLine"
};

export default function UsersPage() {
  return <RolesWorkspace initialTab="users" />;
}
