import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DoubleRule } from "@ledgerline/ui";
import { navigation } from "@/lib/navigation";

export default function DashboardPage() {
  const sections = navigation.filter((item) => item.href !== "/");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Production sprint</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Ledgerline workspace</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Every module below now resolves to a dedicated route with live Postgres-backed list, create, and edit capabilities.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <article key={section.href} className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
            <h2 className="text-lg font-semibold text-ink-900">{section.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{section.children?.length ?? 0} linked screens are available.</p>
            <DoubleRule className="my-4" />
            <div className="space-y-2">
              {section.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="flex items-center justify-between rounded-[6px] border border-slate-200 px-3 py-2 text-sm font-medium text-ink-900 transition hover:bg-paper-50 focus-ring"
                >
                  <span>{child.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
