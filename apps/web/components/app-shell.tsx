"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  Command,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Button, cn } from "@ledgerline/ui";
import { navigation, quickActions } from "@/lib/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <aside className="hidden border-r border-white/10 bg-ink-900 text-white lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="border-b border-white/10 p-4">
          <Link href="/" className="flex items-center gap-3 focus-ring rounded-[8px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brass-500 text-ink-900">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-serif text-xl font-semibold leading-none">Ledgerline</p>
              <p className="mt-1 text-xs text-white/56">Akili Traders Ltd.</p>
            </div>
          </Link>
          <button className="mt-4 flex w-full items-center justify-between rounded-[6px] border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/82 focus-ring">
            <span>Kenya entity</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white focus-ring",
                    isActive && "bg-white/10 text-white shadow-[inset_3px_0_0_var(--brass-500)]"
                  )}
                >
                  {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : <span className="h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
                {isActive && item.children ? (
                  <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-2">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-[5px] px-3 py-1.5 text-xs font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white focus-ring",
                            childActive && "bg-brass-500/[0.14] text-brass-400"
                          )}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-[8px] border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-brass-400" aria-hidden="true" />
              Trial balance clean
            </div>
            <p className="mt-2 text-xs leading-5 text-white/56">All posted journals pass exact debit-credit validation.</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-paper-50/94 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-ink-900 lg:hidden">
              <Menu className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Open navigation</span>
            </button>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                aria-label="Global search"
                placeholder="Navigate. Find transactions, contacts, reports..."
                className="h-10 w-full rounded-[6px] border border-slate-200 bg-white pl-10 pr-10 text-sm text-ink-900 shadow-sm outline-none transition focus:border-focus-blue-500 focus:ring-2 focus:ring-focus-blue-500/20"
              />
              <Command className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" aria-hidden="true" />
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="accent" size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New
              </Button>
              <Button variant="secondary" size="icon" aria-label="AI Business Feed">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigation.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700",
                  (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) &&
                    "border-brass-500 bg-brass-500/10 text-ink-900"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </header>

        <main className="px-4 py-5 md:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>

        <div className="fixed bottom-4 left-1/2 z-30 hidden -translate-x-1/2 gap-2 rounded-[8px] border border-slate-200 bg-white p-2 shadow-ledger-deep xl:flex">
          {quickActions.slice(0, 5).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex h-10 w-10 items-center justify-center rounded-[6px] text-slate-500 transition hover:bg-paper-100 hover:text-ink-900 focus-ring"
                aria-label={action.title}
                title={action.title}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
