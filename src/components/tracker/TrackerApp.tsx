"use client";

import { useEffect, useState } from "react";
import { dueAlerts, nextAlertAt, type Alert } from "@/lib/tracker/rules";
import { DAY, HOUR, fmtDate, fmtDateTime, fmtTime } from "@/lib/tracker/time";
import { cn } from "@/lib/cn";
import { TrackerProvider, alertCopy, useTracker } from "./store";
import { FacilitatorView } from "./FacilitatorView";
import { CoordinatorView } from "./CoordinatorView";
import { Badge, Button } from "./ui";

export function TrackerApp() {
  return (
    <TrackerProvider>
      <div className="min-h-screen bg-background font-normal leading-normal text-foreground">
        <Header />
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
          <Guide />
          <View />
        </main>
        <Toasts />
      </div>
    </TrackerProvider>
  );
}

function View() {
  const { state } = useTracker();
  return state.role === "coordinator" ? <CoordinatorView /> : <FacilitatorView key={state.viewAs} />;
}

function Header() {
  const { state, dispatch } = useTracker();
  const next = nextAlertAt(state);
  const options = [
    ...state.contracts.map((c) => ({ key: c.id, label: c.facilitator, sub: "Facilitator" })),
    { key: "coordinator", label: "Coordinator", sub: "YUAF" },
  ];
  const active = state.role === "coordinator" ? "coordinator" : state.viewAs;

  return (
    <header className="border-b border-subtle bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">Contract Fulfilment Tracker</span>
            <Badge tone="primary">YUAF pilot</Badge>
            <Badge tone="warning">Demo data</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Viewing as</span>
            <div className="flex flex-wrap" role="group" aria-label="Viewing as">
              {options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  aria-pressed={active === o.key}
                  onClick={() =>
                    dispatch(
                      o.key === "coordinator"
                        ? { type: "setRole", role: "coordinator" }
                        : { type: "setRole", role: "facilitator", viewAs: o.key },
                    )
                  }
                  className={cn(
                    "-ml-px border px-2 py-1 text-left text-sm first:ml-0",
                    active === o.key ? "relative border-primary bg-primary text-primary-fg" : "border-subtle bg-surface hover:bg-surface-muted",
                  )}
                >
                  <span className="block font-medium">{o.label}</span>
                  <span className="block text-xs opacity-75">{o.sub}</span>
                </button>
              ))}
            </div>
            <Bell />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border border-dashed border-subtle bg-surface-muted px-2 py-2 text-sm">
          <span className="font-medium">Demo clock</span>
          <span className="tabular-nums">{fmtDateTime(state.now)}</span>
          {state.live && <Badge tone="success">Live</Badge>}
          <span className="mx-1 hidden h-4 border-l border-subtle sm:inline" />
          <Button size="sm" variant="primary" disabled={!next || state.live} onClick={() => next && dispatch({ type: "setNow", now: next })}>
            {next
              ? `Next reminder (${fmtDate(next) === fmtDate(state.now) ? fmtTime(next) : fmtDateTime(next)}) ▶`
              : "No reminders due"}
          </Button>
          <Button size="sm" disabled={state.live} onClick={() => dispatch({ type: "setNow", now: state.now + HOUR })}>
            +1 hour
          </Button>
          <Button size="sm" disabled={state.live} onClick={() => dispatch({ type: "setNow", now: state.now + DAY })}>
            +1 day
          </Button>
          <Button size="sm" onClick={() => dispatch({ type: "setLive", live: !state.live })}>
            {state.live ? "Back to demo time" : "Use real time"}
          </Button>
          <NotifyButton />
          <ResetButton />
        </div>
      </div>
    </header>
  );
}

function ResetButton() {
  const { reset } = useTracker();
  return (
    <Button size="sm" variant="ghost" onClick={() => window.confirm("Reset the demo to its starting point?") && reset()}>
      Reset demo
    </Button>
  );
}

function NotifyButton() {
  const [permission, setPermission] = useState<string>("unsupported");
  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
  }, []);
  if (permission !== "default") return null;
  return (
    <Button size="sm" variant="ghost" onClick={() => Notification.requestPermission().then(setPermission)}>
      Allow browser alerts
    </Button>
  );
}

function alertsFor(state: ReturnType<typeof useTracker>["state"]) {
  return dueAlerts(state).filter((a) =>
    state.role === "coordinator" ? a.audience === "coordinator" : a.audience === "facilitator" && a.contract.id === state.viewAs,
  );
}

function Bell() {
  const { state } = useTracker();
  const [open, setOpen] = useState(false);
  const alerts = alertsFor(state);
  return (
    <div className="relative">
      <Button aria-expanded={open} onClick={() => setOpen((o) => !o)} aria-label={`${alerts.length} alerts`}>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {alerts.length > 0 && <Badge tone="danger">{alerts.length}</Badge>}
      </Button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-subtle bg-surface">
          <div className="border-b border-subtle px-4 py-2 text-sm font-medium">
            {state.role === "coordinator" ? "Escalations" : "Reminders sent to you"}
          </div>
          {alerts.length === 0 ? (
            <p className="p-4 text-sm text-muted">Nothing outstanding.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {alerts.map((a) => {
                const copy = alertCopy(a);
                return (
                  <li key={a.id} className="border-b border-subtle p-4 text-sm last:border-b-0">
                    <div className="font-medium">{copy.title}</div>
                    <div className="text-muted">{copy.body}</div>
                    <div className="mt-1 text-xs text-muted">Sent {fmtDateTime(a.at)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast, dispatch } = useTracker();
  // dismissToast is stable, so each toast's timer runs once.
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden" aria-live="polite">
      {toasts.map((a) => (
        <Toast
          key={a.id}
          alert={a}
          onOpen={() => {
            dispatch(
              a.audience === "coordinator"
                ? { type: "setRole", role: "coordinator" }
                : { type: "setRole", role: "facilitator", viewAs: a.contract.id },
            );
            dismissToast(a.id);
          }}
        />
      ))}
    </div>
  );
}

function Toast({ alert, onOpen }: { alert: Alert; onOpen: () => void }) {
  const { dismissToast } = useTracker();
  useEffect(() => {
    const t = setTimeout(() => dismissToast(alert.id), 12_000);
    return () => clearTimeout(t);
  }, [alert.id, dismissToast]);
  const onDismiss = () => dismissToast(alert.id);
  const copy = alertCopy(alert);
  const to = alert.audience === "coordinator" ? "Project Coordinator" : alert.contract.facilitator;
  return (
    <div className="pointer-events-auto border border-subtle border-l-4 border-l-primary bg-surface p-4 text-sm">
      <div className="text-xs text-muted">
        To {to} · {alert.stage === 3 ? "escalation" : `reminder ${alert.stage}`} · email and SMS in production
      </div>
      <div className="mt-1 font-medium">{copy.title}</div>
      <div className="text-muted">{copy.body}</div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="primary" onClick={onOpen}>
          Open as {to}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

function Guide() {
  const [open, setOpen] = useState(true);
  return (
    <section className="border border-subtle bg-surface print:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium"
      >
        How to try it
        <span className="text-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <ol className="list-decimal border-t border-subtle px-8 py-4 text-sm marker:text-muted">
          <li className="mb-1">
            You&apos;re Kai. Session 4 ended at 20:00 and isn&apos;t green. Press <b className="font-medium">Next reminder</b>: the
            1-hour reminder fires at 21:00.
          </li>
          <li className="mb-1">Press it again for the 9am reminder the next day. Once more and it escalates to the coordinator.</li>
          <li className="mb-1">
            Turn the cell green, or use <b className="font-medium">Report change</b> to record a late start, a move or extra hours.
            The draft pro-forma below updates as you go.
          </li>
          <li className="mb-1">
            Switch to <b className="font-medium">Coordinator</b>. Approve or reject extras, give cancelled sessions a new date, and
            open the <b className="font-medium">Month-end check</b>.
          </li>
          <li>
            Jordan&apos;s October pro-forma is already issued. Change one of his October sessions and watch the difference carry into
            November.
          </li>
        </ol>
      )}
    </section>
  );
}
