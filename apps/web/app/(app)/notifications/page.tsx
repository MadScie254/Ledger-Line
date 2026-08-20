"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, CheckCircle, Info, Package } from "lucide-react";
import { DoubleRule } from "@ledgerline/ui";
import { cn } from "@ledgerline/ui";

interface Notification {
  id: string;
  type: "overdue_invoice" | "low_stock" | "bill_due";
  title: string;
  body: string;
  severity: "error" | "warning" | "info";
  createdAt: string;
}

function NotificationIcon({ type, severity }: { type: Notification["type"]; severity: Notification["severity"] }) {
  if (type === "low_stock") return <Package className="h-5 w-5" />;
  if (severity === "error") return <AlertTriangle className="h-5 w-5" />;
  if (severity === "warning") return <AlertTriangle className="h-5 w-5" />;
  return <Info className="h-5 w-5" />;
}

function severityStyles(severity: Notification["severity"]) {
  if (severity === "error") return "bg-red-50 border-red-200 text-red-700";
  if (severity === "warning") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-blue-50 border-blue-200 text-blue-700";
}

function NotificationCard({ notification }: { notification: Notification }) {
  const isoDays = Math.floor(
    (Date.now() - new Date(notification.createdAt).getTime()) / 86400000
  );
  const ago = isoDays === 0 ? "Today" : isoDays === 1 ? "Yesterday" : `${isoDays} days ago`;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-[8px] border p-4",
        severityStyles(notification.severity)
      )}
    >
      <div className="mt-0.5 shrink-0">
        <NotificationIcon type={notification.type} severity={notification.severity} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm">{notification.title}</p>
        <p className="mt-0.5 text-sm opacity-80">{notification.body}</p>
      </div>
      <span className="shrink-0 text-xs opacity-60">{ago}</span>
    </div>
  );
}

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()) as Promise<{ notifications: Notification[]; count: number }>,
  });

  const notifications = data?.notifications ?? [];

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900">Notifications</h1>
            <p className="mt-3 text-sm text-slate-500">
              Overdue invoices, upcoming bill payments, and inventory alerts.
            </p>
          </div>
          {data && (
            <div className="text-sm text-slate-500">
              {data.count} active alert{data.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <DoubleRule className="mt-5" />
      </header>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[8px] bg-slate-100" />
          ))}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-slate-200 py-20">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
          <p className="font-medium text-ink-900">All clear!</p>
          <p className="text-sm text-slate-500">No overdue invoices, low-stock items, or upcoming bills.</p>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
