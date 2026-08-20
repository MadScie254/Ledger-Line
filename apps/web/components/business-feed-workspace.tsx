"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, Sparkles, Newspaper, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button, DoubleRule, Field, Input } from "@ledgerline/ui";

interface QueryAnswer {
  answer: string;
  valueMinor: number | null;
  reportLink: string;
}

export function BusinessFeedWorkspace() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QueryAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Operational intelligence</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Business Feed</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Ask a real question against posted ledger data and jump to the source report.</p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
        <form className="grid gap-3" onSubmit={(event) => void runQuery(event)}>
          <Field label="Ask a question">
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What is driving my profit this month?"
              required
            />
          </Field>
          <Button type="submit" variant="accent" disabled={isLoading}>
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
            Run query
          </Button>
        </form>

        {error ? <p className="mt-3 text-sm font-medium text-rust-700">{error}</p> : null}
        {answer ? (
          <div className="mt-4 rounded-[6px] border border-slate-200 bg-paper-50 p-3">
            <p className="text-sm font-semibold text-ink-900">{answer.answer}</p>
            <Link href={answer.reportLink} className="mt-2 inline-flex text-sm font-semibold text-focus-blue-500 hover:text-focus-blue-600">
              Open supporting report
            </Link>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <MarketPulseCard />
        <FxMovementsCard />
      </div>
    </div>
  );

  function MarketPulseCard() {
    const { data, isLoading } = useQuery({
      queryKey: ["business-news"],
      queryFn: () => fetch("/api/business-news").then((r) => r.json()),
    });

    const items = data?.items?.slice(0, 5) ?? [];

    return (
      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger flex flex-col">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink-900">
          <Newspaper className="h-5 w-5 text-slate-400" />
          Market Pulse
        </h2>
        <p className="mt-1 text-sm text-slate-500 mb-4">Latest headlines from Kenya business news.</p>

        {isLoading ? (
          <div className="space-y-3 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-[4px] bg-slate-100" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <ul className="space-y-4 flex-1">
            {items.map((item: any, i: number) => (
              <li key={i} className="text-sm">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 hover:text-focus-blue-600 hover:underline line-clamp-2">
                  {item.title}
                </a>
                <p className="mt-1 text-xs text-slate-500">{item.source}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 py-4 flex-1">No news available.</p>
        )}
      </section>
    );
  }

  function FxMovementsCard() {
    const { data, isLoading } = useQuery({
      queryKey: ["currencies"],
      queryFn: () => fetch("/api/settings/currencies").then((r) => r.json()),
    });

    const rates = data?.rates ?? [];
    const base = data?.baseCurrency ?? "KES";

    return (
      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger flex flex-col">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink-900">
          <TrendingUp className="h-5 w-5 text-slate-400" />
          FX Movements
        </h2>
        <p className="mt-1 text-sm text-slate-500 mb-4">Latest ECB rates against your base ({base}).</p>

        {isLoading ? (
          <div className="space-y-3 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-[4px] bg-slate-100" />
            ))}
          </div>
        ) : rates.length > 0 ? (
          <div className="flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-4">Currency</th>
                  <th className="pb-2">Rate (1 {base})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rates.slice(0, 5).map((rate: any) => (
                  <tr key={rate.id} className="hover:bg-paper-100">
                    <td className="py-2.5 pr-4 font-medium text-ink-900">{rate.currencyCode}</td>
                    <td className="py-2.5 font-mono">{Number(rate.rateToBase).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4 flex-1">No FX rates found. Configure them in Settings.</p>
        )}
      </section>
    );
  }

  async function runQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/business-feed/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question })
      });
      const payload = (await response.json()) as QueryAnswer & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Query failed.");
      }

      setAnswer({ answer: payload.answer, valueMinor: payload.valueMinor, reportLink: payload.reportLink });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Query failed.");
    } finally {
      setIsLoading(false);
    }
  }
}
