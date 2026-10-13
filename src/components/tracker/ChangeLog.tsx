"use client";

import { useState } from "react";
import { contractOf, money, periodInfo } from "@/lib/tracker/rules";
import { fmtDateTime } from "@/lib/tracker/time";
import type { ChangeType } from "@/lib/tracker/types";
import { cn } from "@/lib/cn";
import { useTracker } from "./store";
import { Badge, Empty } from "./ui";

type Filter = "all" | "schedule" | "money" | "confirmations";

const FILTERS: Record<Exclude<Filter, "all">, ChangeType[]> = {
  schedule: ["moved", "rescheduled", "cancelled", "missed", "late"],
  money: ["extra", "approved", "rejected", "issued", "agreed", "query", "paid"],
  confirmations: ["confirmed", "unconfirmed"],
};

const TONE: Partial<Record<ChangeType, "success" | "warning" | "danger" | "info">> = {
  confirmed: "success",
  approved: "success",
  agreed: "success",
  paid: "success",
  moved: "info",
  rescheduled: "info",
  issued: "info",
  late: "warning",
  extra: "warning",
  query: "warning",
  cancelled: "danger",
  missed: "danger",
  rejected: "danger",
};

export function ChangeLog({ contractId }: { contractId?: string }) {
  const { state } = useTracker();
  const [filter, setFilter] = useState<Filter>("all");
  const entries = state.changes
    .filter((e) => !contractId || e.contractId === contractId)
    .filter((e) => filter === "all" || FILTERS[filter].includes(e.type))
    .sort((a, b) => b.at - a.at);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Filter changes">
        {(["all", "schedule", "money", "confirmations"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "border px-2 py-1 text-xs font-medium",
              filter === f ? "border-primary bg-primary text-primary-fg" : "border-subtle bg-surface text-muted hover:text-foreground",
            )}
          >
            {f === "all" ? "Everything" : f === "money" ? "Pay and approvals" : f === "schedule" ? "Schedule changes" : "Confirmations"}
          </button>
        ))}
      </div>
      {entries.length === 0 ? (
        <Empty>Nothing recorded yet.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-subtle text-xs text-muted">
                <th className="py-2 pr-2 font-medium">When</th>
                <th className="py-2 pr-2 font-medium">Who</th>
                {!contractId && <th className="py-2 pr-2 font-medium">Contract</th>}
                <th className="py-2 pr-2 font-medium">What changed</th>
                <th className="py-2 text-right font-medium">Effect on pay</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-subtle align-top last:border-b-0">
                  <td className="whitespace-nowrap py-2 pr-2 tabular-nums text-muted">{fmtDateTime(e.at)}</td>
                  <td className="whitespace-nowrap py-2 pr-2">{e.by}</td>
                  {!contractId && <td className="whitespace-nowrap py-2 pr-2">{contractOf(state, e.contractId).facilitator}</td>}
                  <td className="py-2 pr-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Badge tone={TONE[e.type]}>{e.type}</Badge>
                      <span>{e.summary}</span>
                    </div>
                    {e.reason && <div className="mt-1 text-xs text-muted">Reason: {e.reason}</div>}
                  </td>
                  <td className="whitespace-nowrap py-2 text-right tabular-nums">
                    {e.deltaPence ? (
                      <span className={e.deltaPence < 0 ? "text-danger" : "text-success"}>
                        {e.deltaPence > 0 ? "+" : ""}
                        {money(e.deltaPence)}
                      </span>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                    {e.toPeriod && e.fromPeriod && (
                      <div className="text-xs text-info">
                        {periodInfo(e.fromPeriod).month} → {periodInfo(e.toPeriod).month}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
