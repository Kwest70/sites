"use client";

import { useState } from "react";
import {
  EXTRA_LABEL,
  budget,
  contractOf,
  draftPeriodFor,
  extraAmount,
  money,
  periodCheck,
  periodInfo,
  periodOf,
  reminderTimes,
  sessionState,
  type CheckStatus,
  type PeriodCheck,
} from "@/lib/tracker/rules";
import { DAY, fmtDate, fmtDateTime, fmtDuration } from "@/lib/tracker/time";
import type { Session } from "@/lib/tracker/types";
import { cn } from "@/lib/cn";
import { useTracker } from "./store";
import { SessionGrid } from "./SessionGrid";
import { ChangeDialog } from "./ChangeDialog";
import { ChangeLog } from "./ChangeLog";
import { BudgetTable } from "./Budget";
import { ProFormaDoc } from "./ProForma";
import { Badge, Button, Card, Empty, Modal, Stat, Tabs } from "./ui";

type Tab = "attention" | "month-end" | "schedule" | "log" | "budget";

export function CoordinatorView() {
  const { state } = useTracker();
  const [tab, setTab] = useState<Tab>("attention");
  const [contractId, setContractId] = useState(state.contracts[0].id);
  const attention = attentionItems(state);
  const count =
    attention.overdue.length + attention.pending.length + attention.reschedule.length + attention.queries.length + attention.toIssue.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium">Project Coordinator</h1>
        <p className="text-sm text-muted">
          Contract fulfilment across {state.contracts.length} facilitators. Pro-formas cover the 29th to the 28th and are paid on
          the 28th. Queries close on the 26th.
        </p>
      </div>
      <Tabs
        label="Coordinator sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "attention", label: <span className="flex items-center gap-2">Needs attention {count > 0 && <Badge tone="danger">{count}</Badge>}</span> },
          { value: "month-end", label: "Month-end check" },
          { value: "schedule", label: "Delivery schedule" },
          { value: "log", label: "Change log" },
          { value: "budget", label: "Budget by cost code" },
        ]}
      />
      {tab === "attention" && <Attention onGo={(t, id) => { if (id) setContractId(id); setTab(t); }} />}
      {tab === "month-end" && <MonthEnd />}
      {tab === "schedule" && (
        <Card
          title="Delivery schedule"
          subtitle="Record moves, cancellations and late starts here. Only the facilitator can turn a cell green."
          actions={
            <div className="flex flex-wrap gap-1" role="group" aria-label="Choose a contract">
              {state.contracts.map((c) => (
                <Button key={c.id} size="sm" variant={c.id === contractId ? "primary" : "secondary"} onClick={() => setContractId(c.id)}>
                  {c.facilitator}
                </Button>
              ))}
            </div>
          }
        >
          <p className="mb-4 text-sm text-muted">
            {contractOf(state, contractId).project} · {contractOf(state, contractId).role} · Contract {contractOf(state, contractId).number}
          </p>
          <SessionGrid contractId={contractId} editable={false} />
        </Card>
      )}
      {tab === "log" && (
        <Card title="Change log" subtitle="Every change to the delivery schedule, pay or pro-formas, with who made it and why.">
          <ChangeLog />
        </Card>
      )}
      {tab === "budget" && (
        <Card title="Budget by cost code and month">
          <BudgetTable />
        </Card>
      )}
    </div>
  );
}

function attentionItems(state: ReturnType<typeof useTracker>["state"]) {
  const withContract = (s: Session) => ({ s, c: contractOf(state, s.contractId) });
  const sessions = state.sessions.map(withContract);
  const current = periodOf(state.now);
  return {
    overdue: sessions.filter(({ s, c }) => sessionState(s, state.now, c.monitoringDueHours) === "overdue"),
    waiting: sessions.filter(({ s, c }) => sessionState(s, state.now, c.monitoringDueHours) === "awaiting"),
    reschedule: sessions.filter(({ s, c }) => sessionState(s, state.now, c.monitoringDueHours) === "awaiting-reschedule"),
    pending: state.extras.filter((x) => x.status === "pending"),
    queries: state.proformas.filter((p) => p.query),
    toIssue: state.contracts.filter((c) => draftPeriodFor(state, c.id) === current),
  };
}

function Attention({ onGo }: { onGo: (tab: Tab, contractId?: string) => void }) {
  const { state, dispatch, actor } = useTracker();
  const items = attentionItems(state);
  const [dialog, setDialog] = useState<{ contractId: string; sessionId: string } | null>(null);
  const current = periodInfo(periodOf(state.now));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Not confirmed after 24 hours" subtitle="Both reminders have gone to the facilitator. Chase before the pro-forma goes out.">
        {items.overdue.length === 0 ? (
          <Empty>Nothing overdue.</Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.overdue.map(({ s, c }) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border border-danger bg-danger-soft p-2 text-sm">
                <span>
                  <span className="font-medium">{c.facilitator}</span>, session {s.n}, {fmtDateTime(s.start)}
                  <span className="block text-xs text-danger">Ended {fmtDuration(state.now - s.end)} ago, escalated {fmtDateTime(reminderTimes(s, c.monitoringDueHours).escalate)}</span>
                </span>
                <Button size="sm" onClick={() => setDialog({ contractId: c.id, sessionId: s.id })}>
                  Record what happened
                </Button>
              </li>
            ))}
          </ul>
        )}
        {items.waiting.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            Also waiting, still inside the 24 hours: {items.waiting.map(({ s, c }) => `${c.facilitator} session ${s.n}`).join(", ")}.
          </p>
        )}
      </Card>

      <Card title="Waiting for your approval" subtitle="Extra hours and expenses outside the contract. Approved items join the next pro-forma.">
        {items.pending.length === 0 ? (
          <Empty>Nothing to approve.</Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.pending.map((x) => {
              const c = contractOf(state, x.contractId);
              return (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 border border-subtle p-2 text-sm">
                  <span>
                    <span className="font-medium">{c.facilitator}</span>: {EXTRA_LABEL[x.kind]}, {x.description}
                    <span className="block text-xs text-muted">
                      {money(extraAmount(c, x))} · {fmtDate(x.date)} · logged {fmtDateTime(x.loggedAt)}
                    </span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => dispatch({ type: "decide", extraId: x.id, decision: "approved", by: actor })}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => dispatch({ type: "decide", extraId: x.id, decision: "rejected", by: actor })}>
                      Reject
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Cancelled sessions needing a new date" subtitle="Cancelled with 48 hours' notice or more. Not invoiced until rescheduled.">
        {items.reschedule.length === 0 ? (
          <Empty>None.</Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.reschedule.map(({ s, c }) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border border-dashed border-subtle p-2 text-sm">
                <span>
                  <span className="font-medium">{c.facilitator}</span>, session {s.n}, was {fmtDateTime(s.start)}
                </span>
                <Button size="sm" onClick={() => setDialog({ contractId: c.id, sessionId: s.id })}>
                  Give it a new date
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={`${current.label} pro-formas`}
        subtitle={`Sessions ${current.range}. Issue before ${fmtDate(current.queryDeadline)} so facilitators can query, paid ${fmtDate(current.payDate)}.`}
      >
        {items.toIssue.length === 0 ? (
          <Empty>All issued for this period.</Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.toIssue.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border border-subtle p-2 text-sm">
                <span>
                  <span className="font-medium">{c.facilitator}</span> · {c.project}
                </span>
                <Button size="sm" variant="primary" onClick={() => onGo("month-end", c.id)}>
                  Review and issue
                </Button>
              </li>
            ))}
          </ul>
        )}
        {items.queries.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="text-sm font-medium">Queries from facilitators</div>
            {items.queries.map((p) => (
              <div key={p.id} className="border border-warning bg-warning-soft p-2 text-sm text-warning">
                <span className="font-medium">{contractOf(state, p.contractId).facilitator}</span> on {p.number}: “{p.query!.text}”
              </div>
            ))}
          </div>
        )}
      </Card>

      {dialog && <ChangeDialog contractId={dialog.contractId} sessionId={dialog.sessionId} onClose={() => setDialog(null)} />}
    </div>
  );
}

const STATUS: Record<CheckStatus, { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  draft: { label: "Draft, not issued", tone: "neutral" },
  late: { label: "Not issued, query window closed", tone: "danger" },
  matches: { label: "Matches delivery", tone: "success" },
  "awaiting-confirmation": { label: "Waiting for green cells", tone: "warning" },
  carry: { label: "Changed since issue", tone: "warning" },
};

function MonthEnd() {
  const { state } = useTracker();
  const periods = budget(state).periods;
  const [period, setPeriod] = useState(periodOf(state.now));
  const info = periodInfo(period);
  const checks = state.contracts.map((c) => periodCheck(state, c.id, period));
  const [viewing, setViewing] = useState<string | null>(null);
  const daysLeft = Math.ceil((info.payDate - state.now) / DAY);

  const issued = checks.filter((c) => c.proforma);
  const unconfirmed = checks.reduce((t, c) => t + c.unconfirmed.length, 0);
  const carry = checks.filter((c) => c.proforma).reduce((t, c) => t + c.changeTotal, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Tabs
          label="Invoicing period"
          value={period}
          onChange={setPeriod}
          options={periods.map((p) => ({ value: p, label: periodInfo(p).label }))}
        />
        <Button onClick={() => downloadCsv(checks, period)}>Export CSV for the master sheet</Button>
      </div>
      <p className="text-sm text-muted">
        {info.range} · queries close {fmtDate(info.queryDeadline)} · paid {fmtDate(info.payDate)}
        {daysLeft > 0 && daysLeft < 40 && ` · ${daysLeft} days to payday`}
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Pro-formas issued" value={`${issued.length} of ${checks.length}`} />
        <Stat label="Total on pro-formas" value={money(checks.reduce((t, c) => t + c.draftTotal, 0))} note="Issued plus drafts" />
        <Stat label="Sessions not yet green" value={unconfirmed} note={unconfirmed ? "Chase before payday" : "All confirmed"} />
        <Stat label="Carries to next pro-forma" value={money(carry)} note="Changes since issue" />
      </div>

      {checks.map((chk) => (
        <CheckCard key={chk.contract.id} chk={chk} onView={() => setViewing(chk.contract.id)} />
      ))}

      {viewing && (
        <Modal title="Pro-forma" wide onClose={() => setViewing(null)}>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => window.print()}>Print / save PDF</Button>
          </div>
          <ProFormaDoc contractId={viewing} period={period} printable />
        </Modal>
      )}
    </div>
  );
}

function CheckCard({ chk, onView }: { chk: PeriodCheck; onView: () => void }) {
  const { state, dispatch, actor } = useTracker();
  const { contract: c, proforma: pf } = chk;
  const status = STATUS[chk.status];
  const canIssue = !pf && draftPeriodFor(state, c.id) === chk.period;

  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          {c.facilitator} · {c.project}
          <Badge tone={status.tone}>{status.label}</Badge>
        </span>
      }
      subtitle={pf ? `${pf.number} · ${money(pf.totalPence)} · issued ${fmtDateTime(pf.issuedAt)}` : `Draft total ${money(chk.draftTotal)}`}
      actions={
        <>
          <Button size="sm" onClick={onView}>
            View pro-forma
          </Button>
          {canIssue && (
            <Button size="sm" variant="primary" onClick={() => dispatch({ type: "issue", contractId: c.id, period: chk.period, by: actor })}>
              Issue pro-forma
            </Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 text-sm">
          <div className="font-medium">{pf ? "Changed since it was issued" : "Lines on the draft"}</div>
          {chk.changes.length === 0 ? (
            <Empty>{pf ? "Nothing. The pro-forma still matches the delivery schedule." : "Nothing due."}</Empty>
          ) : (
            <ul className="flex flex-col gap-1">
              {chk.changes.map((g) => (
                <li key={g.groupKey} className="flex justify-between gap-2 border-b border-subtle pb-1 last:border-b-0">
                  <span>
                    {g.title}, {fmtDate(g.date)}
                    {g.note && <span className="block text-xs text-muted">{g.note}</span>}
                  </span>
                  <span className={cn("whitespace-nowrap tabular-nums", g.totalPence < 0 && "text-danger")}>{money(g.totalPence)}</span>
                </li>
              ))}
            </ul>
          )}
          {pf && chk.changes.length > 0 && (
            <p className="text-xs text-muted">These carry into the next pro-forma automatically. Nothing to re-issue.</p>
          )}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="font-medium">Checks</div>
          <Check ok={chk.unconfirmed.length === 0}>
            {chk.unconfirmed.length === 0
              ? "Every past session in this period is green"
              : `Not green yet: ${chk.unconfirmed.map((s) => `session ${s.n} (${fmtDate(s.start)})`).join(", ")}`}
          </Check>
          {c.adminHours > 0 && (
            <Check ok={chk.monitoringGaps.length === 0}>
              {chk.monitoringGaps.length === 0
                ? "Monitoring complete for delivered sessions"
                : `Monitoring incomplete: ${chk.monitoringGaps.map((s) => `session ${s.n}`).join(", ")}. Pay for these can move to the 28th of next month.`}
            </Check>
          )}
          <Check ok={chk.pending.length === 0}>
            {chk.pending.length === 0
              ? "No extras waiting for approval"
              : `${chk.pending.length} extra ${chk.pending.length === 1 ? "item" : "items"} waiting for approval (${money(
                  chk.pending.reduce((t, x) => t + extraAmount(c, x), 0),
                )}), not on the pro-forma yet`}
          </Check>
          {pf && (
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pf.dext} onChange={(e) => dispatch({ type: "flag", proformaId: pf.id, field: "dext", value: e.target.checked, by: actor })} />
                Uploaded to Dext
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pf.paid} onChange={(e) => dispatch({ type: "flag", proformaId: pf.id, field: "paid", value: e.target.checked, by: actor })} />
                Paid
              </label>
              {pf.agreedAt ? <Badge tone="success">Agreed by facilitator</Badge> : <Badge>Not agreed yet</Badge>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex gap-2", ok ? "text-success" : "text-warning")}>
      <span aria-hidden>{ok ? "✓" : "!"}</span>
      <span className={ok ? "text-foreground" : ""}>{children}</span>
    </div>
  );
}

function downloadCsv(checks: PeriodCheck[], period: string) {
  const info = periodInfo(period);
  const header = [
    "Period", "Project Strand", "Contract number", "Freelancer Name", "Role", "Rate", "Pro-forma number", "Issued",
    "Pro-forma total", "Delivery", "Admin", "Travel", "Additional hours", "Expenses", "Deliverables",
    "Carries to next", "Sessions not green", "Extras awaiting approval", "Uploaded to Dext?", "Paid?",
  ];
  const rows = checks.map((chk) => {
    const c = chk.contract;
    const pf = chk.proforma;
    const lines = pf ? pf.lines : chk.changes.flatMap((g) => g.lines);
    const byKind = (k: string) => (lines.filter((l) => l.kind === k).reduce((t, l) => t + l.amountPence, 0) / 100).toFixed(2);
    return [
      info.label, c.project, c.number, c.facilitator, c.role, (c.ratePence / 100).toFixed(2), pf?.number ?? "Draft",
      pf ? fmtDate(pf.issuedAt) : "", (chk.draftTotal / 100).toFixed(2), byKind("delivery"), byKind("admin"), byKind("travel"),
      byKind("additional"), byKind("expenses"), byKind("deliverable"), pf ? (chk.changeTotal / 100).toFixed(2) : "",
      chk.unconfirmed.length, chk.pending.length, pf?.dext ? "Yes" : "No", pf?.paid ? "Yes" : "No",
    ];
  });
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `pro-formas-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

