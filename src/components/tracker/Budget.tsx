"use client";

import { Fragment } from "react";
import { budget, kindWord, money, periodInfo, type BudgetRow } from "@/lib/tracker/rules";
import { cn } from "@/lib/cn";
import { useTracker } from "./store";

const sentence = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const sum = (r: Record<string, number>) => Object.values(r).reduce((t, v) => t + v, 0);

function Cell({ contracted, forecast, invoiced }: { contracted: number; forecast: number; invoiced: number }) {
  const diff = forecast - contracted;
  return (
    <div className="flex flex-col items-end tabular-nums">
      <span className="font-medium">{money(forecast)}</span>
      <span className="text-xs text-muted">budget {money(contracted)}</span>
      {invoiced !== 0 && <span className="text-xs text-info">invoiced {money(invoiced)}</span>}
      {diff !== 0 && (
        <span className={cn("text-xs font-medium", diff > 0 ? "text-danger" : "text-success")}>
          {diff > 0 ? "+" : ""}
          {money(diff)}
        </span>
      )}
    </div>
  );
}

export function BudgetTable() {
  const { state } = useTracker();
  const { periods, rows } = budget(state);
  const byContract = state.contracts.map((c) => ({ c, rows: rows.filter((r) => r.contract.id === c.id) }));
  const total = (pick: (r: BudgetRow) => Record<string, number>, p?: string) =>
    rows.reduce((t, r) => t + (p ? pick(r)[p] ?? 0 : sum(pick(r))), 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Each cell shows the forecast from the current schedule (bold), the budget as originally contracted, what has been
        invoiced on issued pro-formas, and the difference from budget. Months are invoicing periods (29th to 28th). Cost
        codes are placeholders: swap in your finance codes.
      </p>
      <div className="overflow-x-auto border border-subtle bg-surface">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-subtle bg-surface-muted text-xs text-muted">
              <th className="px-2 py-2 text-left font-medium">Cost code</th>
              {periods.map((p) => (
                <th key={p} className="px-2 py-2 text-right font-medium">
                  {periodInfo(p).label}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {byContract.map(({ c, rows: rs }) => (
              <Fragment key={c.id}>
                <tr className="border-b border-subtle">
                  <th colSpan={periods.length + 2} className="px-2 pb-1 pt-4 text-left text-sm font-medium">
                    {c.project} · {c.facilitator} <span className="font-normal text-muted">({c.number})</span>
                  </th>
                </tr>
                {rs.map((r) => (
                  <tr key={r.costCode} className="border-b border-subtle align-top">
                    <td className="px-2 py-2">
                      <div className="font-medium">{r.costCode}</div>
                      <div className="text-xs text-muted">{sentence(kindWord(c, r.kind))}</div>
                    </td>
                    {periods.map((p) => (
                      <td key={p} className="px-2 py-2">
                        <Cell contracted={r.contracted[p] ?? 0} forecast={r.forecast[p] ?? 0} invoiced={r.invoiced[p] ?? 0} />
                      </td>
                    ))}
                    <td className="bg-surface-muted px-2 py-2">
                      <Cell contracted={sum(r.contracted)} forecast={sum(r.forecast)} invoiced={sum(r.invoiced)} />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-foreground align-top">
              <th className="px-2 py-2 text-left font-medium">All contracts</th>
              {periods.map((p) => (
                <td key={p} className="px-2 py-2">
                  <Cell
                    contracted={total((r) => r.contracted, p)}
                    forecast={total((r) => r.forecast, p)}
                    invoiced={total((r) => r.invoiced, p)}
                  />
                </td>
              ))}
              <td className="bg-surface-muted px-2 py-2">
                <Cell contracted={total((r) => r.contracted)} forecast={total((r) => r.forecast)} invoiced={total((r) => r.invoiced)} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
