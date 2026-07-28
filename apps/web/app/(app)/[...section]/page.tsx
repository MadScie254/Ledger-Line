import { notFound } from "next/navigation";
import { ComponentCatalog } from "@/components/component-catalog";
import { ModulePage } from "@/components/module-page";
import { navigation, quickActions, titleFromPath } from "@/lib/navigation";

interface SectionPageProps {
  params: Promise<{
    section: string[];
  }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  const pathname = `/${section.join("/")}`;

  if (pathname === "/catalog") {
    return <ComponentCatalog />;
  }

  const validPaths = new Set([
    ...navigation.flatMap((item) => [item.href, ...(item.children ?? []).map((child) => child.href)]),
    ...quickActions.map((action) => action.href),
    "/notifications",
    "/sales/invoices/new",
    "/expenses/expenses/new",
    "/accounting/journal-entries/new"
  ]);

  if (!validPaths.has(pathname)) {
    notFound();
  }

  return <ModulePage pathname={pathname} title={titleFromPath(pathname)} />;
}
