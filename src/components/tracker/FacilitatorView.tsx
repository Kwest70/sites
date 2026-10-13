"use client";

import { useState } from "react";
import {
  contractOf,
  contractProgress,
  dueAlerts,
  draftPeriodFor,
  hoursText,
  money,
  periodInfo,
} from "@/lib/tracker/rules";
import { useTracker, alertCopy } from "./store";
import { SessionGrid } from "./SessionGrid";
import { ChangeDialog } from "./ChangeDialog";
import { FacilitatorProFormaActions, ProFormaDoc } from "./ProForma";
import { ChangeLog } from "./ChangeLog";
import { Badge, Button, Card, Stat, Tabs } from "./ui";

export function FacilitatorView() {
  const { state, dispatch, actor } = useTracker();
  const c = contractOf(state, state.viewAs);
  const p = contractProgress(state, c.id);
  const reminders = dueAlerts(state).filter((a) => a.contract.id === c.id && a.audience === "facilitator");
  // One banner per session: the latest reminder for it.
  const latest = reminders.filter((a, i) => reminders.findIndex((b) => b.session.id === a.session.id) === i);
  const [logging, setLogging] = useState(false);
  const [changing, setChanging] = useState<string | null>(null);

  const issued = state.proformas.filter((pf) => pf.contractId === c.id).map((pf) => pf.period);
  const draft = draftPeriodFor(state, c.id);
  const periods = [...issued, draft];
  const [period, setPeriod] = useState(draft);
  const shown = periods.includes(period) ? period : draft;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium">{c.facilitator}</h1>
        <p className="text-sm text-muted">
          {c.role} · {c.project}
          {c.practice && ` · ${c.practice}`} · {c.venue} · Contract {c.number}
        </p>
      </div>

      {latest.map((a) => {
        const copy = alertCopy(a);
        return (
          <div
            key={a.id}
            role="alert"
            className="flex flex-col gap-2 border border-warning bg-warning-soft p-4 text-warning md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-medium">{copy.title}</div>
              <div className="text-sm">{copy.body}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="success" onClick={() => dispatch({ type: "confirm", sessionId: a.session.id, by: actor })}>
                Yes, turn it green
              </Button>
              <Button onClick={() => setChanging(a.session.id)}>Something changed</Button>
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Contracted" value={hoursText(p.contractedHours)} note={money(p.contractedPence)} />
        <Stat label="Confirmed so far" value={hoursText(p.confirmedHours)} note={money(p.confirmedPence)} />
        <Stat label="Sessions still to deliver" value={p.sessionsLeft} note="Includes any waiting for a new date" />
        <Stat
          label="Outside the contract"
          value={money(p.extrasApproved)}
          note={p.extrasPending ? `${money(p.extrasPending)} waiting for approval` : "Nothing waiting"}
        />
      </div>

      <Card
        title="My sessions"
        subtitle="Turn each cell green once the session has gone ahead. If anything changed, report it here so your pro-forma is right."
        actions={<Button onClick={() => setLogging(true)}>Log extra hours or expense</Button>}
      >
        <SessionGrid contractId={c.id} editable />
        <p className="mt-2 text-xs text-muted">{c.termsSource}</p>
      </Card>

      <Card
        title="My pro-formas"
        subtitle="Built from the cells above. Anything that changes after one is issued carries into the next one automatically."
        actions={
          <Button onClick={() => window.print()} aria-label="Print or save this pro-forma as a PDF">
            Print / save PDF
          </Button>
        }
      >
        <Tabs
          label="Pro-forma period"
          value={shown}
          onChange={setPeriod}
          options={periods.map((k) => ({
            value: k,
            label: (
              <span className="flex items-center gap-2">
                {periodInfo(k).label}
                {k === draft && <Badge tone="warning">Draft</Badge>}
              </span>
            ),
          }))}
        />
        <div className="mt-4 flex flex-col gap-4">
          <FacilitatorProFormaActions contractId={c.id} period={shown} />
          <ProFormaDoc contractId={c.id} period={shown} printable />
        </div>
      </Card>

      <Card title="Change history" subtitle="Everything recorded against your contract, newest first.">
        <ChangeLog contractId={c.id} />
      </Card>

      {logging && <ChangeDialog contractId={c.id} onClose={() => setLogging(false)} />}
      {changing && <ChangeDialog contractId={c.id} sessionId={changing} onClose={() => setChanging(null)} />}
    </div>
  );
}
