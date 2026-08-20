"use client";

import { useQuery } from "@tanstack/react-query";
import { Coins, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { DoubleRule } from "@ledgerline/ui";

interface ExchangeRateRow {
  id: string;
  currencyCode: string;
  rateToBase: string;
  asOfDate: string;
}

interface CurrenciesResponse {
  rates: ExchangeRateRow[];
  baseCurrency: string;
  lastUpdated: string | null;
}

export default function Page() {
  const { data, isLoading, refetch, isFetching } = useQuery<CurrenciesResponse>({
    queryKey: ["currencies"],
    queryFn: () => fetch("/api/settings/currencies").then((r) => r.json()),
  });

  const rates = data?.rates ?? [];
  const baseCurrency = data?.baseCurrency ?? "KES";
  const lastUpdated = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900">Currencies</h1>
            <p className="mt-3 text-sm text-slate-500">
              Live exchange rates sourced daily from the European Central Bank via{" "}
              <a
                href="https://frankfurter.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ink-900"
              >
                frankfurter.dev
              </a>
              .
            </p>
          </div>
          <button
            onClick={() => fetch("/api/cron/exchange-rates").then(() => refetch())}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:bg-paper-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh rates
          </button>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      <div className="rounded-[8px] border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Coins className="h-4 w-4" />
          <span>
            Base currency: <strong className="text-ink-900">{baseCurrency}</strong>
          </span>
          {lastUpdated && (
            <span className="ml-auto">Last updated: {lastUpdated}</span>
          )}
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-[6px] bg-slate-100" />
            ))}
          </div>
        )}

        {!isLoading && rates.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            No exchange rates found. Click &quot;Refresh rates&quot; to fetch today&apos;s rates from Frankfurter.
          </div>
        )}

        {!isLoading && rates.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-4">Currency</th>
                <th className="pb-2 pr-4">Rate (1 {baseCurrency} =)</th>
                <th className="pb-2">As of Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-paper-100">
                  <td className="py-3 pr-4 font-medium text-ink-900">{rate.currencyCode}</td>
                  <td className="py-3 pr-4 font-mono">
                    {Number(rate.rateToBase).toFixed(4)}
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(rate.asOfDate).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
