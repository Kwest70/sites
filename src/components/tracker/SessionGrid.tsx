"use client";

import { useState } from "react";
import { CANCEL_BY_LABEL, noticeText } from "@/lib/tracker/actions";
import {
  EXTRA_LABEL,
  MONITORING,
  contractOf,
  extraAmount,
  hoursText,
  isPayable,
  money,
  monitoringComplete,
  needsConfirmation,
  periodInfo,
  periodOf,
  reminderTimes,
  sessionLines,
  sessionState,
  type SessionState,
} from "@/lib/tracker/rules";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/tracker/time";
import type { Contract, Session } from "@/lib/tracker/types";
import { cn } from "@/lib/cn";
import { ChangeDialog } from "./ChangeDialog";
import { useTracker } from "./store";
import { Badge, Button } from "./ui";

const GRID =
  "md:grid md:grid-cols-[3rem_minmax(9rem,1fr)_minmax(11rem,1.1fr)_5rem_6rem_minmax(12rem,1.6fr)_8rem] md:items-center";

export function SessionGrid({ contractId, editable }: { contractId: string; editable: boolean }) {
  const { state } = useTracker();
  const c = contractOf(state, contractId);
  const sessions = state.sessions.filter((s) => s.contractId === contractId).sort((a, b) => a.start - b.start);
  const [dialog, setDialog] = useState<string | null>(null);

  return (
    <div className="border border-subtle bg-surface">
      <div className={cn(GRID, "hidden border-b border-subtle bg-surface-muted text-xs font-medium text-muted md:grid")}>
        <div className="px-2 py-2">#</div>
        <div className="px-2 py-2">When</div>
        <div className="px-2 py-2">Delivered?</div>
        <div className="px-2 py-2 text-right">Hours</div>
        <div className="px-2 py-2 text-right">Amount</div>
        <div className="px-2 py-2">Notes</div>
        <div className="px-2 py-2" />
      </div>
      {sessions.map((s) => (
        <Row key={s.id} c={c} s={s} editable={editable} onChange={() => setDialog(s.id)} />
      ))}
      {dialog && <ChangeDialog contractId={contractId} sessionId={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

function Row({ c, s, editable, onChange }: { c: Contract; s: Session; editable: boolean; onChange: () => void }) {
  const { state, dispatch, actor } = useTracker();
  const st = sessionState(s, state.now, c.monitoringDueHours);
  const lines = sessionLines(c, s, state.now);
  const payable = lines.filter((l) => isPayable(l.state));
  const amount = payable.reduce((t, l) => t + l.amountPence, 0);
  const hours = payable.filter((l) => l.hours !== undefined).map((l) => hoursText(l.hours!));
  const onHold = st === "awaiting-reschedule";
  const moved = s.start !== s.plannedStart;

  return (
    <div className={cn(GRID, "flex flex-col gap-2 border-b border-subtle p-2 last:border-b-0 md:gap-0 md:p-0")}>
      <div className="flex items-baseline gap-2 md:block md:px-2 md:py-2">
        <span className="text-sm font-medium tabular-nums">
          <span className="md:hidden">Session </span>
          {s.n}
        </span>
        {s.units > 1 && <Badge tone="info">Double</Badge>}
      </div>
      <div className="text-sm md:px-2 md:py-2">
        <div className="font-medium">{fmtDate(s.start)}</div>
        <div className="text-muted tabular-nums">
          {fmtTime(s.start)} to {fmtTime(s.end)}
        </div>
        <div className="text-xs text-muted">{periodInfo(periodOf(s.start)).month} period</div>
        {moved && <div className="text-xs text-muted line-through">{fmtDateTime(s.plannedStart)}</div>}
      </div>
      <div className="md:px-2 md:py-2">
        <StatusCell c={c} s={s} st={st} editable={editable} onToggle={(confirm) =>
          dispatch(confirm ? { type: "confirm", sessionId: s.id, by: actor } : { type: "unconfirm", sessionId: s.id, by: actor })
        } />
      </div>
      <div className="flex justify-between text-sm tabular-nums md:block md:px-2 md:py-2 md:text-right">
        <span className="text-muted md:hidden">Hours</span>
        <span className={cn(!payable.length && "text-muted")}>{hours.length ? hours.join(" + ") : "0h"}</span>
      </div>
      <div className="flex justify-between text-sm tabular-nums md:block md:px-2 md:py-2 md:text-right">
        <span className="text-muted md:hidden">Amount</span>
        <span className={cn(!payable.length && "text-muted")}>
          {onHold ? "On hold" : money(amount)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 md:px-2 md:py-2">
        <Notes c={c} s={s} st={st} editable={editable} />
      </div>
      <div className="md:px-2 md:py-2 md:text-right">
        <Button size="sm" onClick={onChange} className="w-full md:w-auto">
          {onHold ? "New date" : "Report change"}
        </Button>
      </div>
    </div>
  );
}

const CELL: Record<SessionState, string> = {
  delivered: "bg-success text-success-fg border-success",
  awaiting: "bg-warning-soft text-warning border-warning border-dashed",
  overdue: "bg-danger-soft text-danger border-danger border-dashed",
  "in-progress": "bg-info-soft text-info border-info",
  upcoming: "bg-surface-muted text-muted border-subtle",
  missed: "bg-surface-muted text-muted border-subtle line-through",
  "cancelled-paid": "bg-info-soft text-info border-info",
  "awaiting-reschedule": "bg-surface text-muted border-subtle border-dashed",
  "cancelled-unpaid": "bg-surface-muted text-muted border-subtle",
};

function StatusCell({
  c,
  s,
  st,
  editable,
  onToggle,
}: {
  c: Contract;
  s: Session;
  st: SessionState;
  editable: boolean;
  onToggle: (confirm: boolean) => void;
}) {
  const { state } = useTracker();
  const t = reminderTimes(s, c.monitoringDueHours);
  const canConfirm = editable && (st === "in-progress" || needsConfirmation(st));
  const canUndo = editable && st === "delivered";

  let main: string;
  let sub: string | undefined;
  switch (st) {
    case "delivered":
      main = "✓ Delivered";
      sub = `Confirmed ${fmtDateTime(s.confirmedAt!)}`;
      break;
    case "awaiting":
      main = editable ? "Not confirmed: tap to turn green" : "Not confirmed yet";
      sub =
        state.now >= t.second
          ? "2 reminders sent"
          : state.now >= t.first
            ? `Reminder sent ${fmtTime(t.first)}`
            : `Ended ${fmtTime(s.end)}, reminder at ${fmtTime(t.first)}`;
      break;
    case "overdue":
      main = editable ? "Overdue: tap to turn green" : "Overdue";
      sub = "Coordinator alerted";
      break;
    case "in-progress":
      main = editable ? "In progress: tap when done" : "In progress";
      break;
    case "upcoming":
      main = "Upcoming";
      break;
    case "missed":
      main = "Didn't go ahead";
      sub = "Not payable";
      break;
    case "cancelled-paid":
      main = "Cancelled, paid in full";
      sub = "Under 48 hours' notice";
      break;
    case "awaiting-reschedule":
      main = "Cancelled: needs a new date";
      sub = "Not invoiced until rescheduled";
      break;
    case "cancelled-unpaid":
      main = "Cancelled by facilitator";
      sub = "Not payable";
      break;
  }

  const body = (
    <>
      <span className="block text-sm font-medium">{main}</span>
      {sub && <span className="block text-xs opacity-90">{sub}</span>}
    </>
  );
  const base = cn("block w-full border px-2 py-2 text-left", CELL[st]);

  if (canConfirm || canUndo) {
    return (
      <button
        type="button"
        className={cn(base, "transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary")}
        aria-pressed={st === "delivered"}
        title={canUndo ? "Click to turn it back if this was a mistake" : "Click once the session has gone ahead"}
        onClick={() => {
          if (canUndo && !window.confirm(`Turn session ${s.n} back from green?`)) return;
          onToggle(canConfirm);
        }}
      >
        {body}
      </button>
    );
  }
  return <div className={base}>{body}</div>;
}

function Notes({ c, s, st, editable }: { c: Contract; s: Session; st: SessionState; editable: boolean }) {
  const { state, dispatch } = useTracker();
  const extras = state.extras.filter((x) => x.sessionId === s.id);
  const notes: JSX.Element[] = [];

  if (s.start !== s.plannedStart) notes.push(<Badge key="moved" tone="info">Moved from {fmtDate(s.plannedStart)}</Badge>);
  if (s.lateMinutes > 0 && st !== "cancelled-paid")
    notes.push(<Badge key="late" tone="warning">{s.lateMinutes} min late</Badge>);
  if (s.cancellation)
    notes.push(
      <Badge key="cancel">
        By {CANCEL_BY_LABEL[s.cancellation.by]}, {noticeText(s.start - s.cancellation.noticeAt)}
      </Badge>,
    );
  for (const x of extras) {
    const tone = x.status === "approved" ? "success" : x.status === "rejected" ? "neutral" : "warning";
    notes.push(
      <Badge key={x.id} tone={tone}>
        {EXTRA_LABEL[x.kind]} {money(extraAmount(c, x))} {x.status === "pending" ? "pending" : x.status}
      </Badge>,
    );
  }

  const showMonitoring = c.adminHours > 0 && st === "delivered";
  return (
    <>
      {notes}
      {showMonitoring &&
        (editable ? (
          <div className="flex flex-wrap gap-1" role="group" aria-label={`Monitoring for session ${s.n}`}>
            {MONITORING.map((m) => (
              <button
                key={m.key}
                type="button"
                aria-pressed={s.monitoring[m.key]}
                onClick={() => dispatch({ type: "monitoring", sessionId: s.id, key: m.key, value: !s.monitoring[m.key] })}
                className={cn(
                  "border px-2 py-0.5 text-xs",
                  s.monitoring[m.key] ? "border-success bg-success-soft text-success" : "border-warning bg-warning-soft text-warning",
                )}
              >
                {s.monitoring[m.key] ? "✓" : "○"} {m.label}
              </button>
            ))}
          </div>
        ) : (
          <Badge tone={monitoringComplete(s) ? "success" : "warning"}>
            Monitoring {MONITORING.filter((m) => s.monitoring[m.key]).length}/{MONITORING.length}
          </Badge>
        ))}
      {notes.length === 0 && !showMonitoring && <span className="text-xs text-muted">No changes</span>}
    </>
  );
}
