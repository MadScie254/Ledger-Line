"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, Sparkles } from "lucide-react";
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
    </div>
  );

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
