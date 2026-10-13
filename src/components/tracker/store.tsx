"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import { reduce, type Action } from "@/lib/tracker/actions";
import { demoState, STATE_VERSION } from "@/lib/tracker/seed";
import { contractOf, dueAlerts, type Alert } from "@/lib/tracker/rules";
import { fmtDate, fmtTime } from "@/lib/tracker/time";
import type { TrackerState } from "@/lib/tracker/types";

const STORAGE_KEY = "yuaf-contract-tracker";
export const COORDINATOR = "Project Coordinator";

export function alertCopy(a: Alert) {
  const { session: s, contract: c } = a;
  const when = `${fmtDate(s.start)}, ${fmtTime(s.start)} to ${fmtTime(s.end)}`;
  if (a.stage === 1)
    return {
      title: `Did session ${s.n} go ahead?`,
      body: `Your ${c.project} session (${when}) ended an hour ago. If it went ahead, turn its cell green. If anything changed, report it so your pro-forma is right.`,
    };
  if (a.stage === 2)
    return {
      title: `Reminder: session ${s.n} still isn't green`,
      body: `Session ${s.n} on ${fmtDate(s.start)} is still unconfirmed. Monitoring paperwork is due within ${c.monitoringDueHours} hours of the session ending.`,
    };
  return {
    title: `Unconfirmed: ${c.facilitator}, session ${s.n}`,
    body: `${c.project}, ${when}. Still not confirmed ${c.monitoringDueHours} hours after it ended. Check with the facilitator before the pro-forma goes out.`,
  };
}

function notifyBrowser(a: Alert) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const { title, body } = alertCopy(a);
    new Notification(title, { body, tag: a.id });
  } catch {
    // Browser notifications are a bonus; the in-app alert still shows.
  }
}

interface TrackerContext {
  state: TrackerState;
  dispatch: (a: Action) => void;
  /** Who the change log records as making a change. */
  actor: string;
  toasts: Alert[];
  dismissToast: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<TrackerContext | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, undefined, demoState);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Alert[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as TrackerState | null;
      if (saved?.version === STATE_VERSION) dispatch({ type: "load", state: saved });
    } catch {
      // Private mode or corrupt data: start from the demo.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Not saving is fine for a demo.
    }
  }, [state, ready]);

  useEffect(() => {
    if (!state.live) return;
    const t = setInterval(() => dispatch({ type: "setNow", now: Date.now() }), 30_000);
    return () => clearInterval(t);
  }, [state.live]);

  // Reminders are derived from the clock, so they fire whenever time passes a threshold.
  useEffect(() => {
    if (!ready) return;
    const fresh = dueAlerts(state).filter((a) => !state.firedAlerts.includes(a.id));
    if (fresh.length === 0) return;
    dispatch({ type: "fired", ids: fresh.map((a) => a.id) });
    setToasts((t) => [...fresh, ...t].slice(0, 4));
    fresh.forEach(notifyBrowser);
  }, [state, ready]);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((a) => a.id !== id)), []);
  const reset = useCallback(() => {
    setToasts([]);
    dispatch({ type: "load", state: demoState() });
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  const actor = state.role === "coordinator" ? COORDINATOR : contractOf(state, state.viewAs).facilitator;
  return (
    <Ctx.Provider value={{ state, dispatch, actor, toasts, dismissToast, reset }}>{children}</Ctx.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTracker needs <TrackerProvider>");
  return ctx;
}
