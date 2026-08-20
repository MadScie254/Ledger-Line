"use client";

import { useQuery } from "@tanstack/react-query";
import { EmployeesWorkspace } from "@/components/employees-workspace";

export default function Page() {
  const { data: orgData } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => fetch("/api/settings/company").then((res) => res.json()),
  });
  return <EmployeesWorkspace baseCurrency={orgData?.baseCurrency ?? "KES"} />;
}
