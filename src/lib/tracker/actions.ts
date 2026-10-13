import type {
  CancelBy,
  ChangeEntry,
  ChangeType,
  Extra,
  MonitoringKey,
  ProForma,
  Role,
  Session,
  TrackerState,
} from "./types";
import { fmtDateTime, fmtDuration, HOUR } from "./time";
import {
  FULL_PAY_NOTICE_HOURS,
  contractOf,
  extraAmount,
  groupTitle,
  isPayable,
  ledger,
  money,
  periodOf,
  proformaNumber,
  reminderTimes,
  sessionLines,
} from "./rules";

export type Action =
  | { type: "load"; state: TrackerState }
  | { type: "setNow"; now: number }
  | { type: "setLive"; live: boolean }
  | { type: "setRole"; role: Role; viewAs?: string }
  | { type: "fired"; ids: string[] }
  | { type: "confirm"; sessionId: string; by: string }
  | { type: "unconfirm"; sessionId: string; by: string }
  | { type: "monitoring"; sessionId: string; key: MonitoringKey; value: boolean }
  | { type: "move"; sessionId: string; start: number; end: number; by: string; reason: string }
  | { type: "late"; sessionId: string; minutes: number; by: string; reason: string }
  | { type: "missed"; sessionId: string; by: string; reason: string }
  | { type: "cancel"; sessionId: string; cancelBy: CancelBy; noticeAt: number; by: string; reason: string }
  | { type: "addExtra"; extra: Omit<Extra, "id" | "status" | "loggedAt" | "loggedBy">; by: string }
  | { type: "decide"; extraId: string; decision: "approved" | "rejected"; by: string }
  | { type: "issue"; contractId: string; period: string; by: string }
  | { type: "agree"; proformaId: string; by: string }
  | { type: "query"; proformaId: string; text: string; by: string }
  | { type: "flag"; proformaId: string; field: "dext" | "paid"; value: boolean; by: string };

export const CANCEL_BY_LABEL: Record<CancelBy, string> = {
  yuaf: "YUAF",
  partner: "the partner or venue",
  "young-person": "the young person",
  facilitator: "the facilitator",
};

/** "20 hours' notice" */
export function noticeText(ms: number) {
  const d = fmtDuration(ms);
  return `${d}${d.endsWith("s") ? "'" : ""} notice`;
}

let counter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}`;

/** What a session is currently worth to the facilitator. */
function sessionValue(state: TrackerState, s: Session) {
  const c = contractOf(state, s.contractId);
  return sessionLines(c, s, state.now)
    .filter((l) => isPayable(l.state))
    .reduce((t, l) => t + l.amountPence, 0);
}

function log(state: TrackerState, entry: Omit<ChangeEntry, "id" | "at">): TrackerState {
  return { ...state, changes: [...state.changes, { id: uid("chg"), at: state.now, ...entry }] };
}

function updateSession(
  state: TrackerState,
  sessionId: string,
  patch: (s: Session) => Session,
  entry: (before: Session, after: Session) => { type: ChangeType; summary: string; reason?: string; by: string },
): TrackerState {
  const before = state.sessions.find((s) => s.id === sessionId);
  if (!before) return state;
  const after = patch(before);
  const next = { ...state, sessions: state.sessions.map((s) => (s.id === sessionId ? after : s)) };
  const delta = sessionValue(next, after) - sessionValue(state, before);
  const fromPeriod = periodOf(before.start);
  const toPeriod = periodOf(after.start);
  return log(next, {
    ...entry(before, after),
    contractId: before.contractId,
    sessionId,
    deltaPence: delta || undefined,
    fromPeriod,
    toPeriod: toPeriod !== fromPeriod ? toPeriod : undefined,
  });
}

function confirmedSummary(state: TrackerState, s: Session) {
  const c = contractOf(state, s.contractId);
  const t = reminderTimes(s, c.monitoringDueHours);
  const when =
    state.now >= t.escalate
      ? "after the coordinator was alerted"
      : state.now >= t.second
        ? "after 2 reminders"
        : state.now >= t.first
          ? "after 1 reminder"
          : "before any reminder";
  return `Turned session ${s.n} green ${when}`;
}

function updateProforma(state: TrackerState, id: string, patch: (p: ProForma) => ProForma) {
  return { ...state, proformas: state.proformas.map((p) => (p.id === id ? patch(p) : p)) };
}

export function reduce(state: TrackerState, action: Action): TrackerState {
  switch (action.type) {
    case "load":
      return action.state;
    case "setNow":
      return { ...state, now: action.now };
    case "setLive":
      return { ...state, live: action.live, now: action.live ? Date.now() : state.now };
    case "setRole":
      return { ...state, role: action.role, viewAs: action.viewAs ?? state.viewAs };
    case "fired":
      return { ...state, firedAlerts: Array.from(new Set([...state.firedAlerts, ...action.ids])) };

    case "confirm":
      return updateSession(
        state,
        action.sessionId,
        (s) => ({ ...s, confirmedAt: state.now, missed: false }),
        (s) => ({ type: "confirmed", by: action.by, summary: confirmedSummary(state, s) }),
      );
    case "unconfirm":
      return updateSession(
        state,
        action.sessionId,
        (s) => ({ ...s, confirmedAt: undefined }),
        (s) => ({ type: "unconfirmed", by: action.by, summary: `Turned session ${s.n} back from green` }),
      );
    case "monitoring":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId ? { ...s, monitoring: { ...s.monitoring, [action.key]: action.value } } : s,
        ),
      };

    case "move":
      return updateSession(
        state,
        action.sessionId,
        (s) => ({ ...s, start: action.start, end: action.end, cancellation: undefined }),
        (b, a) => ({
          type: b.cancellation ? "rescheduled" : "moved",
          by: action.by,
          reason: action.reason,
          summary: b.cancellation
            ? `Gave session ${b.n} a new date: ${fmtDateTime(a.start)}`
            : `Moved session ${b.n} from ${fmtDateTime(b.start)} to ${fmtDateTime(a.start)}`,
        }),
      );
    case "late":
      return updateSession(
        state,
        action.sessionId,
        (s) => ({ ...s, lateMinutes: action.minutes }),
        (s) => ({
          type: "late",
          by: action.by,
          reason: action.reason,
          summary: `Facilitator arrived ${action.minutes} min late to session ${s.n}`,
        }),
      );
    case "missed":
      return updateSession(
        state,
        action.sessionId,
        (s) => ({ ...s, missed: true, confirmedAt: undefined }),
        (s) => ({ type: "missed", by: action.by, reason: action.reason, summary: `Session ${s.n} did not go ahead` }),
      );
    case "cancel":
      return updateSession(
        state,
        action.sessionId,
        (s) => ({ ...s, cancellation: { by: action.cancelBy, noticeAt: action.noticeAt }, confirmedAt: undefined }),
        (s) => {
          const notice = s.start - action.noticeAt;
          const rule =
            action.cancelBy === "facilitator"
              ? "not payable"
              : notice < FULL_PAY_NOTICE_HOURS * HOUR
                ? "under 48 hours, so payable in full"
                : "48 hours or more, so it needs a new date before it is invoiced";
          return {
            type: "cancelled",
            by: action.by,
            reason: action.reason,
            summary: `Session ${s.n} cancelled by ${CANCEL_BY_LABEL[action.cancelBy]} with ${noticeText(notice)}: ${rule}`,
          };
        },
      );

    case "addExtra": {
      const extra: Extra = {
        ...action.extra,
        id: uid("x"),
        status: "pending",
        loggedAt: state.now,
        loggedBy: action.by,
      };
      const c = contractOf(state, extra.contractId);
      const next = { ...state, extras: [...state.extras, extra] };
      return log(next, {
        type: "extra",
        by: action.by,
        contractId: extra.contractId,
        sessionId: extra.sessionId,
        summary: `Logged ${groupTitle(next, extra.id)}, ${money(extraAmount(c, extra))}, awaiting approval`,
      });
    }
    case "decide": {
      const x = state.extras.find((e) => e.id === action.extraId);
      if (!x) return state;
      const c = contractOf(state, x.contractId);
      const next = {
        ...state,
        extras: state.extras.map((e) => (e.id === x.id ? { ...e, status: action.decision } : e)),
      };
      return log(next, {
        type: action.decision,
        by: action.by,
        contractId: x.contractId,
        sessionId: x.sessionId,
        summary: `${action.decision === "approved" ? "Approved" : "Rejected"} ${groupTitle(state, x.id)}`,
        deltaPence: action.decision === "approved" ? extraAmount(c, x) : undefined,
        fromPeriod: periodOf(x.date),
      });
    }

    case "issue": {
      const c = contractOf(state, action.contractId);
      if (state.proformas.some((p) => p.contractId === c.id && p.period === action.period)) return state;
      const draft = ledger(state, c.id, action.period, "draft");
      const seq = state.proformas.filter((p) => p.contractId === c.id).length + 1;
      const pf: ProForma = {
        id: uid("pf"),
        contractId: c.id,
        period: action.period,
        seq,
        number: proformaNumber(c, seq),
        issuedAt: state.now,
        issuedBy: action.by,
        lines: draft.groups.flatMap((g) => g.lines.map((l) => ({ ...l, note: g.note || l.note }))),
        totalPence: draft.totalPence,
        dext: false,
        paid: false,
      };
      return log(
        { ...state, proformas: [...state.proformas, pf] },
        {
          type: "issued",
          by: action.by,
          contractId: c.id,
          summary: `Issued pro-forma ${pf.number}: ${money(pf.totalPence)}`,
          fromPeriod: action.period,
        },
      );
    }
    case "agree": {
      const pf = state.proformas.find((p) => p.id === action.proformaId);
      if (!pf) return state;
      return log(
        updateProforma(state, pf.id, (p) => ({ ...p, agreedAt: state.now })),
        { type: "agreed", by: action.by, contractId: pf.contractId, summary: `Agreed pro-forma ${pf.number}` },
      );
    }
    case "query": {
      const pf = state.proformas.find((p) => p.id === action.proformaId);
      if (!pf) return state;
      return log(
        updateProforma(state, pf.id, (p) => ({ ...p, query: { at: state.now, text: action.text } })),
        {
          type: "query",
          by: action.by,
          contractId: pf.contractId,
          summary: `Raised a query on pro-forma ${pf.number}`,
          reason: action.text,
        },
      );
    }
    case "flag": {
      const pf = state.proformas.find((p) => p.id === action.proformaId);
      if (!pf) return state;
      const next = updateProforma(state, pf.id, (p) => ({ ...p, [action.field]: action.value }));
      if (action.field !== "paid") return next;
      return log(next, {
        type: "paid",
        by: action.by,
        contractId: pf.contractId,
        summary: action.value ? `Marked ${pf.number} as paid` : `Marked ${pf.number} as unpaid`,
      });
    }
  }
}
