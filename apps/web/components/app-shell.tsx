"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Command,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button, cn } from "@ledgerline/ui";
import { navigation, quickActions } from "@/lib/navigation";
import { useQuery } from "@tanstack/react-query";
import { OrgSwitcher } from "./org-switcher";
import { FileText, FileDown, Receipt, Users, Building } from "lucide-react";

function NewButtonDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    { label: "Invoice", href: "/sales/invoices", icon: FileText },
    { label: "Bill", href: "/expenses/bills", icon: FileDown },
    { label: "Expense", href: "/expenses/expenses", icon: Receipt },
    { label: "Customer", href: "/sales/customers", icon: Users },
    { label: "Vendor", href: "/expenses/vendors", icon: Building },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="accent" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        New
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-[8px] border border-slate-200 bg-white p-1 shadow-ledger-deep animate-in fade-in zoom-in-95">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  setIsOpen(false);
                  router.push(item.href);
                }}
                className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-sm text-ink-900 transition hover:bg-paper-100"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const COLLAPSED_KEY = "ll_sidebar_collapsed";
const OPEN_SECTION_KEY = "ll_sidebar_open_section";

// ─── Sidebar Nav ────────────────────────────────────────────────────────────

function SidebarNav({
  collapsed,
  pathname,
  openSection,
  setOpenSection,
}: {
  collapsed: boolean;
  pathname: string;
  openSection: string | null;
  setOpenSection: (section: string | null) => void;
}) {
  return (
    <nav aria-label="Primary" className={cn("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openSection === item.href;

        return (
          <div key={item.href}>
            {hasChildren && !collapsed ? (
              <button
                onClick={() => setOpenSection(isOpen ? null : item.href)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-[6px] px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white focus-ring",
                  isActive && "bg-white/10 text-white shadow-[inset_3px_0_0_var(--brass-500)]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : <span className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{item.title}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
              </button>
            ) : (
              <Link
                href={item.href}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white focus-ring",
                  isActive && "bg-white/10 text-white shadow-[inset_3px_0_0_var(--brass-500)]",
                  collapsed && "justify-center px-2"
                )}
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : <span className="h-4 w-4 shrink-0" />}
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            )}

            {!collapsed && isOpen && hasChildren ? (
              <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-2">
                {item.children!.map((child) => {
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
  );
}

// ─── Mobile Drawer ───────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  pathname,
  orgName,
  openSection,
  setOpenSection,
  isTbClean,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  orgName: string;
  openSection: string | null;
  setOpenSection: (section: string | null) => void;
  isTbClean: boolean;
}) {
  // Close on pathname change
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-ink-900 text-white shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 focus-ring rounded-[8px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brass-500 text-ink-900 shrink-0">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-serif text-xl font-semibold leading-none">Ledgerline</p>
              <p className="mt-1 text-xs text-white/56 truncate max-w-[140px]">{orgName}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-white/60 hover:bg-white/10 hover:text-white focus-ring"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarNav collapsed={false} pathname={pathname} openSection={openSection} setOpenSection={setOpenSection} />

        <div className="border-t border-white/10 p-4">
          <div className="rounded-[8px] border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className={cn("h-4 w-4", isTbClean ? "text-brass-400" : "text-rust-500")} aria-hidden="true" />
              {isTbClean ? "Trial balance clean" : "Trial balance out of sync"}
            </div>
            <p className="mt-2 text-xs leading-5 text-white/56">
              {isTbClean ? "All posted journals pass exact debit-credit validation." : "Debit and credit totals do not match."}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Global Search ───────────────────────────────────────────────────────────

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["search-recent"],
    queryFn: () => fetch("/api/search/recent").then((res) => res.json()),
  });
  const recent = data?.recent || [];

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navFiltered = query.length > 0
    ? navigation
        .flatMap((item) => [item, ...(item.children ?? [])])
        .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : [];

  const recentFiltered = query.length > 0
    ? recent
        .filter((item: any) => item.title.toLowerCase().includes(query.toLowerCase()) || item.subtitle.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 4)
    : recent.slice(0, 5);

  function handleSelect(href: string) {
    router.push(href);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      <input
        ref={inputRef}
        id="global-search"
        aria-label="Global search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setQuery(""); inputRef.current?.blur(); }
          if (e.key === "Enter") {
            if (navFiltered.length > 0) handleSelect(navFiltered[0]!.href);
            else if (recentFiltered.length > 0) handleSelect(recentFiltered[0]!.href);
          }
        }}
        placeholder="Navigate. Find transactions, contacts, reports..."
        className="h-10 w-full rounded-[6px] border border-slate-200 bg-white pl-10 pr-10 text-sm text-ink-900 shadow-sm outline-none transition focus:border-focus-blue-500 focus:ring-2 focus:ring-focus-blue-500/20"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:flex">
        <Command className="h-3 w-3" />K
      </kbd>

      {focused && (navFiltered.length > 0 || recentFiltered.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-ledger-deep py-2">
          {navFiltered.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</div>
              {navFiltered.map((item) => (
                <button
                  key={item.href}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-ink-900 hover:bg-paper-100 focus-ring"
                  onMouseDown={() => handleSelect(item.href)}
                >
                  {item.icon ? (
                    <item.icon className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  {item.title}
                </button>
              ))}
            </div>
          )}
          {recentFiltered.length > 0 && (
            <div>
              <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {query.length > 0 ? "Records" : "Recent Records"}
              </div>
              {recentFiltered.map((item: any) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-ink-900 hover:bg-paper-100 focus-ring"
                  onMouseDown={() => handleSelect(item.href)}
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.subtitle}</div>
                  </div>
                  <div className="text-xs text-slate-400 capitalize">{item.type}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AppShell ────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  orgName: initialOrgName = "My Organisation",
}: {
  children: ReactNode;
  orgName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: orgData } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => fetch("/api/settings/company").then((res) => res.json()),
  });

  const { data: tbData } = useQuery({
    queryKey: ["trial-balance"],
    queryFn: () => fetch("/api/reports/trial-balance").then((res) => res.json()),
  });

  const orgName = orgData?.name || initialOrgName;
  const baseCurrency: string = orgData?.baseCurrency ?? "KES";
  const isTbClean = tbData?.isBalanced ?? true;

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  });

  const [openSectionState, setOpenSectionState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(OPEN_SECTION_KEY);
    if (stored) return stored;
    return navigation.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? null;
  });

  const setOpenSection = useCallback((section: string | null) => {
    setOpenSectionState(section);
    if (section) {
      localStorage.setItem(OPEN_SECTION_KEY, section);
    } else {
      localStorage.removeItem(OPEN_SECTION_KEY);
    }
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen lg:flex">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden border-r border-white/10 bg-ink-900 text-white lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:sticky lg:top-0 transition-all duration-300",
          collapsed ? "lg:w-[68px]" : "lg:w-[288px]"
        )}
      >
        {/* Logo / Org */}
        <div className={cn("border-b border-white/10", collapsed ? "p-3" : "p-4")}>
          {collapsed ? (
            <Link href="/dashboard" title="LedgerLine" className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brass-500 text-ink-900 focus-ring mx-auto">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 focus-ring rounded-[8px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brass-500 text-ink-900 shrink-0">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-xl font-semibold leading-none">Ledgerline</p>
                  <p className="mt-1 text-xs text-white/56 truncate">{orgName}</p>
                </div>
              </Link>
              <OrgSwitcher currentOrgId={orgData?.id} currentOrgName={orgName} />
            </>
          )}
        </div>

        <SidebarNav collapsed={collapsed} pathname={pathname} openSection={openSectionState} setOpenSection={setOpenSection} />

        {/* Bottom panel */}
        {!collapsed && (
          <div className="border-t border-white/10 p-4">
            <div className="rounded-[8px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className={cn("h-4 w-4", isTbClean ? "text-brass-400" : "text-rust-500")} aria-hidden="true" />
                {isTbClean ? "Trial balance clean" : "Trial balance out of sync"}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/56">
                {isTbClean ? "All posted journals pass exact debit-credit validation." : "Debit and credit totals do not match."}
              </p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className={cn("border-t border-white/10 p-2", collapsed && "flex justify-center")}>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-full items-center justify-center gap-2 rounded-[6px] px-2 text-xs text-white/50 hover:bg-white/10 hover:text-white transition focus-ring"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        orgName={orgName}
        openSection={openSectionState}
        setOpenSection={setOpenSection}
        isTbClean={isTbClean}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-paper-50/94 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-ink-900 lg:hidden shrink-0"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Global search */}
            <GlobalSearch />

            {/* Actions */}
            <div className="hidden items-center gap-2 md:flex shrink-0">
              <NewButtonDropdown />
              <Button
                variant="secondary"
                size="icon"
                aria-label="AI Business Feed"
                onClick={() => router.push("/business-feed")}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Notifications"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Mobile quick-nav pills */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigation.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition",
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

        {/* Desktop quick-action dock */}
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
