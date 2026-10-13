import type {
  Contract,
  CostKind,
  Extra,
  MonitoringKey,
  ProForma,
  ProFormaLine,
  Role,
  Session,
  TrackerState,
} from "./types";
import { HOUR, fmtDate, fmtDay, fromLondon, londonParts, monthName } from "./time";

// ─── Invoicing periods ──────────────────────────────────────────────────────
// A period runs from the 29th to the 28th inclusive and is paid on the 28th,
// matching the pro-forma wording "sessions up to 28 Oct 2026, paid Wed 28 Oct".

export const PERIOD_END_DAY = 28;
export const QUERY_DEADLINE_DAY = 26;
/** Contract clause 11: under 48 hours' notice is paid in full. */
export const FULL_PAY_NOTICE_HOURS = 48;

const periodKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;
const parsePeriod = (k: string) => k.split("-").map(Number) as [number, number];

export function periodOf(ms: number) {
  const { y, m, d } = londonParts(ms);
  if (d <= PERIOD_END_DAY) return periodKey(y, m);
  return m === 12 ? periodKey(y + 1, 1) : periodKey(y, m + 1);
}

export function shiftPeriod(k: string, n: number) {
  const [y, m] = parsePeriod(k);
  const i = y * 12 + (m - 1) + n;
  return periodKey(Math.floor(i / 12), (i % 12) + 1);
}

export function periodInfo(k: string) {
  const [y, m] = parsePeriod(k);
  const start = fromLondon(y, m - 1, PERIOD_END_DAY + 1);
  const lastDay = fromLondon(y, m, PERIOD_END_DAY);
  return {
    key: k,
    label: `${monthName(m)} ${y}`,
    month: monthName(m),
    start,
    /** Exclusive. */
    end: fromLondon(y, m, PERIOD_END_DAY + 1),
    payDate: fromLondon(y, m, PERIOD_END_DAY, 12),
    queryDeadline: fromLondon(y, m, QUERY_DEADLINE_DAY),
    range: `${fmtDay(start)} to ${fmtDay(lastDay)}`,
  };
}

// ─── Sessions ───────────────────────────────────────────────────────────────

export type SessionState =
  | "upcoming"
  | "in-progress"
  | "awaiting"
  | "overdue"
  | "delivered"
  | "missed"
  | "cancelled-paid"
  | "awaiting-reschedule"
  | "cancelled-unpaid";

export const MONITORING: { key: MonitoringKey; label: string }[] = [
  { key: "plan", label: "Session plan" },
  { key: "tracker", label: "Goal tracker" },
  { key: "upshot", label: "Upshot reflection" },
  { key: "upload", label: "Paperwork on G-Drive" },
];

export const monitoringComplete = (s: Session) => MONITORING.every((m) => s.monitoring[m.key]);

export function noticeHours(s: Session) {
  return s.cancellation ? (s.start - s.cancellation.noticeAt) / HOUR : Infinity;
}

/** Reminder 1 an hour after the end, reminder 2 at 9am next day, then the coordinator. */
export function reminderTimes(s: Session, monitoringDueHours = 24) {
  const first = s.end + HOUR;
  const p = londonParts(s.end);
  const second = fromLondon(p.y, p.m, p.d + 1, 9);
  const escalate = Math.max(s.end + monitoringDueHours * HOUR, second + 2 * HOUR);
  return { first, second, escalate };
}

export function sessionState(s: Session, now: number, monitoringDueHours = 24): SessionState {
  if (s.cancellation) {
    if (s.cancellation.by === "facilitator") return "cancelled-unpaid";
    return noticeHours(s) < FULL_PAY_NOTICE_HOURS ? "cancelled-paid" : "awaiting-reschedule";
  }
  if (s.missed) return "missed";
  if (s.confirmedAt) return "delivered";
  if (now < s.start) return "upcoming";
  if (now < s.end) return "in-progress";
  return now >= reminderTimes(s, monitoringDueHours).escalate ? "overdue" : "awaiting";
}

export const needsConfirmation = (st: SessionState) => st === "awaiting" || st === "overdue";

// ─── Alerts ─────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  stage: 1 | 2 | 3;
  at: number;
  audience: Role;
  session: Session;
  contract: Contract;
}

export function dueAlerts(state: TrackerState, now = state.now): Alert[] {
  const out: Alert[] = [];
  for (const s of state.sessions) {
    const c = contractOf(state, s.contractId);
    if (!needsConfirmation(sessionState(s, now, c.monitoringDueHours))) continue;
    const t = reminderTimes(s, c.monitoringDueHours);
    const stages: [1 | 2 | 3, number, Role][] = [
      [1, t.first, "facilitator"],
      [2, t.second, "facilitator"],
      [3, t.escalate, "coordinator"],
    ];
    for (const [stage, at, audience] of stages) {
      // The end time is part of the id, so a moved session gets fresh reminders.
      if (at <= now) out.push({ id: `${s.id}@${s.end}#${stage}`, stage, at, audience, session: s, contract: c });
    }
  }
  return out.sort((a, b) => b.at - a.at);
}

/** The next moment a reminder or escalation would fire, for the demo clock. */
export function nextAlertAt(state: TrackerState): number | null {
  let next: number | null = null;
  for (const s of state.sessions) {
    if (s.confirmedAt || s.missed || s.cancellation) continue;
    const c = contractOf(state, s.contractId);
    const t = reminderTimes(s, c.monitoringDueHours);
    for (const at of [t.first, t.second, t.escalate]) {
      if (at > state.now && (next === null || at < next)) next = at;
    }
  }
  return next;
}

// ─── Money lines ────────────────────────────────────────────────────────────

export type LineState =
  | "billable"
  | "unconfirmed"
  | "upcoming"
  | "pending"
  | "awaiting-reschedule"
  | "not-payable"
  | "rejected";

export type LineFlag =
  | "unconfirmed"
  | "late-arrival"
  | "late-cancellation"
  | "moved-period"
  | "monitoring-incomplete";

export interface Line {
  key: string;
  groupKey: string;
  contractId: string;
  sessionId?: string;
  extraId?: string;
  kind: CostKind;
  costCode: string;
  date: number;
  period: string;
  hours?: number;
  amountPence: number;
  state: LineState;
  flags: LineFlag[];
}

const LINE_STATE: Record<SessionState, LineState> = {
  delivered: "billable",
  "cancelled-paid": "billable",
  upcoming: "upcoming",
  "in-progress": "upcoming",
  awaiting: "unconfirmed",
  overdue: "unconfirmed",
  "awaiting-reschedule": "awaiting-reschedule",
  missed: "not-payable",
  "cancelled-unpaid": "not-payable",
};

/** Lines that count towards what the facilitator is owed. */
export const isPayable = (st: LineState) => st === "billable" || st === "unconfirmed" || st === "upcoming";

const pay = (hours: number, ratePence: number) => Math.round(hours * ratePence);

export function contractOf(state: TrackerState, id: string) {
  const c = state.contracts.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown contract ${id}`);
  return c;
}

export function sessionLines(c: Contract, s: Session, now: number): Line[] {
  const st = sessionState(s, now, c.monitoringDueHours);
  const state = LINE_STATE[st];
  const period = periodOf(s.start);
  const zero = state === "not-payable";
  const flags: LineFlag[] = [];
  if (periodOf(s.plannedStart) !== period) flags.push("moved-period");
  if (st === "cancelled-paid") flags.push("late-cancellation");
  if (state === "unconfirmed") flags.push("unconfirmed");

  const lateMinutes = st === "cancelled-paid" ? 0 : s.lateMinutes;
  const deliveryHours = Math.max(0, c.deliveryHours * s.units - lateMinutes / 60);
  const base = { groupKey: s.id, contractId: c.id, sessionId: s.id, date: s.start, period, state };
  const lines: Line[] = [
    {
      ...base,
      key: `${s.id}:delivery`,
      kind: "delivery",
      costCode: c.costCodes.delivery,
      hours: deliveryHours,
      amountPence: zero ? 0 : pay(deliveryHours, c.ratePence),
      flags: lateMinutes > 0 ? [...flags, "late-arrival"] : flags,
    },
  ];
  if (c.adminHours > 0) {
    const adminHours = c.adminHours * s.units;
    lines.push({
      ...base,
      key: `${s.id}:admin`,
      kind: "admin",
      costCode: c.costCodes.admin,
      hours: adminHours,
      amountPence: zero ? 0 : pay(adminHours, c.ratePence),
      flags: st === "delivered" && !monitoringComplete(s) ? [...flags, "monitoring-incomplete"] : flags,
    });
  }
  if (c.travelPence > 0) {
    // One journey per session, even a double. No journey if it was cancelled.
    const noJourney = zero || st === "cancelled-paid";
    lines.push({
      ...base,
      key: `${s.id}:travel`,
      kind: "travel",
      costCode: c.costCodes.travel,
      amountPence: noJourney ? 0 : c.travelPence,
      state: st === "cancelled-paid" ? "not-payable" : state,
      flags,
    });
  }
  return lines;
}

const EXTRA_KIND: Record<Extra["kind"], CostKind> = {
  hours: "additional",
  travel: "travel",
  expense: "expenses",
  deliverable: "deliverable",
};

export function extraAmount(c: Contract, x: Extra) {
  return x.kind === "hours" ? pay(x.hours ?? 0, c.ratePence) : x.amountPence ?? 0;
}

export function extraLine(c: Contract, x: Extra, now: number): Line {
  const kind = EXTRA_KIND[x.kind];
  const state: LineState =
    x.status === "rejected" ? "rejected" : x.status === "pending" ? "pending" : x.date > now ? "upcoming" : "billable";
  return {
    key: `${x.id}:${kind}`,
    groupKey: x.id,
    contractId: c.id,
    extraId: x.id,
    sessionId: x.sessionId,
    kind,
    costCode: c.costCodes[kind],
    date: x.date,
    period: periodOf(x.date),
    hours: x.hours,
    amountPence: extraAmount(c, x),
    state,
    flags: [],
  };
}

export function contractLines(state: TrackerState, contractId: string, now = state.now): Line[] {
  const c = contractOf(state, contractId);
  return [
    ...state.sessions.filter((s) => s.contractId === c.id).flatMap((s) => sessionLines(c, s, now)),
    ...state.extras.filter((x) => x.contractId === c.id).map((x) => extraLine(c, x, now)),
  ];
}

// ─── Descriptions ───────────────────────────────────────────────────────────

const KIND_WORD: Record<CostKind, string> = {
  delivery: "delivery",
  admin: "admin",
  travel: "travel",
  additional: "additional hours",
  expenses: "expenses",
  deliverable: "deliverable",
};

export const kindWord = (c: Contract, k: CostKind) =>
  k === "admin" ? c.adminLabel.toLowerCase() : k === "delivery" && c.adminHours === 0 ? "fee" : KIND_WORD[k];

export const EXTRA_LABEL: Record<Extra["kind"], string> = {
  hours: "Additional hours",
  travel: "Travel",
  expense: "Expense",
  deliverable: "Deliverable",
};

export function groupTitle(state: TrackerState, groupKey: string) {
  const s = state.sessions.find((x) => x.id === groupKey);
  if (s) return s.units > 1 ? `Session ${s.n}: double session, paid as ${s.units}` : `Session ${s.n}`;
  const x = state.extras.find((e) => e.id === groupKey);
  if (!x) return groupKey;
  return `${EXTRA_LABEL[x.kind]}${x.hours ? ` (${hoursText(x.hours)})` : ""}: ${x.description}`;
}

export const money = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

export const hoursText = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(2).replace(/0$/, "")}h`;

// ─── Pro-forma ledger ───────────────────────────────────────────────────────
// Every pro-forma line carries a ledger key. What is owed for a key, minus what
// earlier pro-formas already paid for it, is what the next pro-forma carries.
// That one rule covers new sessions, roll-forwards, late arrivals, deductions
// for sessions paid in advance that didn't happen, and late approvals.

export type GroupKind = "new" | "rolled-forward" | "adjustment" | "deduction";

export interface LedgerGroup {
  groupKey: string;
  sessionId?: string;
  date: number;
  title: string;
  kind: GroupKind;
  note: string;
  lines: ProFormaLine[];
  totalPence: number;
  flags: LineFlag[];
}

export interface LedgerInfo {
  groupKey: string;
  date: number;
  title: string;
  note: string;
  amountPence: number;
}

function invoicedFor(proformas: ProForma[], key: string) {
  let amount = 0;
  const numbers: string[] = [];
  for (const pf of proformas) {
    for (const l of pf.lines) {
      if (l.key !== key) continue;
      amount += l.amountPence;
      if (!numbers.includes(pf.number)) numbers.push(pf.number);
    }
  }
  return { amount, numbers };
}

/** What a line is owed when settling everything up to `through`. */
function owed(line: Line, through: string, alreadyInvoiced: number) {
  if (!isPayable(line.state)) return 0;
  // Already paid and still going ahead in a later period: no claw-back.
  if (line.period <= through || alreadyInvoiced !== 0) return line.amountPence;
  return 0;
}

function deductionReason(state: TrackerState, line: Line) {
  if (line.extraId) return line.state === "rejected" ? "not approved" : "awaiting approval";
  const s = state.sessions.find((x) => x.id === line.sessionId);
  if (!s) return "no longer due";
  const c = contractOf(state, s.contractId);
  const st = sessionState(s, state.now, c.monitoringDueHours);
  if (st === "missed") return "not delivered";
  if (st === "awaiting-reschedule") return "cancelled with 48h+ notice, payable once it has a new date";
  if (st === "cancelled-unpaid") return "cancelled by the facilitator";
  if (line.kind === "travel" && st === "cancelled-paid") return "cancelled, so no journey";
  return "no longer due";
}

/** Why a line is not the plain contracted amount, written onto the pro-forma. */
function detail(state: TrackerState, line: Line) {
  const s = state.sessions.find((x) => x.id === line.sessionId);
  if (!s || line.extraId) return "";
  const parts: string[] = [];
  if (line.flags.includes("late-cancellation")) parts.push("cancelled with under 48 hours' notice, paid in full");
  if (line.flags.includes("late-arrival")) parts.push(`started ${s.lateMinutes} min late`);
  if (s.start !== s.plannedStart) parts.push(`moved from ${fmtDate(s.plannedStart)}`);
  return parts.join(", ");
}

/**
 * Lines a pro-forma for `period` would carry.
 * `mode: "draft"` nets off pro-formas before the period (what to issue next).
 * `mode: "check"` nets off pro-formas up to and including it (what has changed since).
 */
export function ledger(state: TrackerState, contractId: string, period: string, mode: "draft" | "check") {
  const c = contractOf(state, contractId);
  const prior = state.proformas.filter(
    (pf) => pf.contractId === contractId && (mode === "draft" ? pf.period < period : pf.period <= period),
  );
  const groups = new Map<string, LedgerGroup>();
  const info = new Map<string, LedgerInfo>();

  for (const line of contractLines(state, contractId)) {
    const inv = invoicedFor(prior, line.key);
    const due = owed(line, period, inv.amount);
    const diff = due - inv.amount;
    if (diff === 0) {
      if (inv.amount !== 0 && line.period === period) {
        const i = info.get(line.groupKey);
        if (i) i.amountPence += inv.amount;
        else
          info.set(line.groupKey, {
            groupKey: line.groupKey,
            date: line.date,
            title: groupTitle(state, line.groupKey),
            note: `already invoiced on ${inv.numbers.join(", ")} (not included in this total)`,
            amountPence: inv.amount,
          });
      }
      continue;
    }

    const kind: GroupKind =
      inv.amount === 0
        ? line.period < period
          ? "rolled-forward"
          : "new"
        : due === 0
          ? "deduction"
          : "adjustment";

    const why = detail(state, line);
    let note: string;
    if (kind === "rolled-forward")
      note = `not yet invoiced, rolled forward from ${periodInfo(line.period).month}${why ? `, ${why}` : ""}`;
    else if (kind === "deduction") note = `paid on ${inv.numbers.join(", ")} but ${deductionReason(state, line)}`;
    else if (kind === "adjustment")
      note = `adjusts ${inv.numbers.join(", ")}${why ? `: ${why}` : ""}`;
    else note = why;

    const pfLine: ProFormaLine = {
      key: line.key,
      groupKey: line.groupKey,
      kind: line.kind,
      costCode: line.costCode,
      date: line.date,
      description: kindWord(c, line.kind),
      note,
      amountPence: diff,
    };

    const g = groups.get(line.groupKey);
    if (g) {
      g.lines.push(pfLine);
      g.totalPence += diff;
      g.flags = Array.from(new Set([...g.flags, ...line.flags]));
      if (RANK[kind] > RANK[g.kind]) {
        g.kind = kind;
        g.note = note;
      }
    } else {
      groups.set(line.groupKey, {
        groupKey: line.groupKey,
        sessionId: line.sessionId,
        date: line.date,
        title: groupTitle(state, line.groupKey),
        kind,
        note,
        lines: [pfLine],
        totalPence: diff,
        flags: [...line.flags],
      });
    }
  }

  const list = Array.from(groups.values()).sort((a, b) => a.date - b.date);
  return {
    groups: list,
    info: Array.from(info.values()).sort((a, b) => a.date - b.date),
    totalPence: list.reduce((t, g) => t + g.totalPence, 0),
  };
}

const RANK: Record<GroupKind, number> = { new: 0, "rolled-forward": 1, adjustment: 2, deduction: 3 };

/** "£60 delivery + £30 admin" */
export function breakdown(lines: ProFormaLine[]) {
  return lines.map((l) => `${money(l.amountPence)} ${l.description}`).join(" + ");
}

export function proformaNumber(c: Contract, seq: number) {
  return `${c.number}-${String(seq).padStart(2, "0")}`;
}

/** The period the next pro-forma should cover: the current one, or the one after the last issued. */
export function draftPeriodFor(state: TrackerState, contractId: string) {
  const current = periodOf(state.now);
  const issued = state.proformas.filter((p) => p.contractId === contractId).map((p) => p.period);
  let p = current;
  while (issued.includes(p)) p = shiftPeriod(p, 1);
  return p;
}

// ─── Month-end check ────────────────────────────────────────────────────────

export type CheckStatus = "draft" | "late" | "matches" | "awaiting-confirmation" | "carry";

export interface PeriodCheck {
  contract: Contract;
  period: string;
  proforma?: ProForma;
  draftTotal: number;
  changes: LedgerGroup[];
  changeTotal: number;
  unconfirmed: Session[];
  pending: Extra[];
  monitoringGaps: Session[];
  status: CheckStatus;
}

export function periodCheck(state: TrackerState, contractId: string, period: string): PeriodCheck {
  const c = contractOf(state, contractId);
  const proforma = state.proformas.find((p) => p.contractId === contractId && p.period === period);
  const result = ledger(state, contractId, period, proforma ? "check" : "draft");
  const inPeriod = state.sessions.filter((s) => s.contractId === contractId && periodOf(s.start) === period);
  const unconfirmed = inPeriod.filter((s) => needsConfirmation(sessionState(s, state.now, c.monitoringDueHours)));
  const monitoringGaps = inPeriod.filter((s) => s.confirmedAt && !monitoringComplete(s));
  const pending = state.extras.filter(
    (x) => x.contractId === contractId && x.status === "pending" && periodOf(x.date) <= period,
  );

  let status: CheckStatus;
  if (!proforma) status = state.now >= periodInfo(period).queryDeadline ? "late" : "draft";
  else if (result.groups.length > 0) status = "carry";
  else if (unconfirmed.length > 0) status = "awaiting-confirmation";
  else status = "matches";

  return {
    contract: c,
    period,
    proforma,
    draftTotal: proforma ? proforma.totalPence : result.totalPence,
    changes: result.groups,
    changeTotal: result.totalPence,
    unconfirmed,
    pending,
    monitoringGaps,
    status,
  };
}

// ─── Budget by cost code and month ──────────────────────────────────────────

export interface BudgetRow {
  contract: Contract;
  kind: CostKind;
  costCode: string;
  contracted: Record<string, number>;
  forecast: Record<string, number>;
  invoiced: Record<string, number>;
}

/** What each session was worth on its original date and terms. */
function plannedLines(c: Contract, s: Session) {
  const period = periodOf(s.plannedStart);
  const out: { kind: CostKind; period: string; amount: number }[] = [
    { kind: "delivery", period, amount: pay(c.deliveryHours * s.units, c.ratePence) },
  ];
  if (c.adminHours > 0) out.push({ kind: "admin", period, amount: pay(c.adminHours * s.units, c.ratePence) });
  if (c.travelPence > 0) out.push({ kind: "travel", period, amount: c.travelPence });
  return out;
}

export function budget(state: TrackerState) {
  const rows = new Map<string, BudgetRow>();
  const periods = new Set<string>();
  const row = (c: Contract, kind: CostKind) => {
    const k = `${c.id}:${kind}`;
    let r = rows.get(k);
    if (!r) {
      r = { contract: c, kind, costCode: c.costCodes[kind], contracted: {}, forecast: {}, invoiced: {} };
      rows.set(k, r);
    }
    return r;
  };
  const add = (rec: Record<string, number>, p: string, v: number) => {
    periods.add(p);
    rec[p] = (rec[p] ?? 0) + v;
  };

  for (const c of state.contracts) {
    for (const s of state.sessions.filter((x) => x.contractId === c.id)) {
      for (const l of plannedLines(c, s)) add(row(c, l.kind).contracted, l.period, l.amount);
    }
    for (const x of state.extras.filter((e) => e.contractId === c.id && e.kind === "deliverable")) {
      add(row(c, "deliverable").contracted, periodOf(x.date), extraAmount(c, x));
    }
    for (const l of contractLines(state, c.id)) {
      if (isPayable(l.state)) add(row(c, l.kind).forecast, l.period, l.amountPence);
    }
    for (const pf of state.proformas.filter((p) => p.contractId === c.id)) {
      for (const l of pf.lines) add(row(c, l.kind).invoiced, pf.period, l.amountPence);
    }
  }
  const order: CostKind[] = ["delivery", "admin", "travel", "deliverable", "additional", "expenses"];
  return {
    periods: Array.from(periods).sort(),
    rows: Array.from(rows.values()).sort(
      (a, b) =>
        state.contracts.indexOf(a.contract) - state.contracts.indexOf(b.contract) ||
        order.indexOf(a.kind) - order.indexOf(b.kind),
    ),
  };
}

// ─── Contract progress ──────────────────────────────────────────────────────

export function contractProgress(state: TrackerState, contractId: string) {
  const c = contractOf(state, contractId);
  const sessions = state.sessions.filter((s) => s.contractId === contractId);
  const perUnit = c.deliveryHours + c.adminHours;
  const units = sessions.reduce((t, s) => t + s.units, 0);
  const lines = contractLines(state, contractId);
  const sessionKinds: CostKind[] = ["delivery", "admin"];
  const confirmed = lines.filter((l) => l.state === "billable" && sessionKinds.includes(l.kind));
  const extras = state.extras.filter((x) => x.contractId === contractId && x.kind !== "deliverable");
  const sum = (xs: Extra[]) => xs.reduce((t, x) => t + extraAmount(c, x), 0);
  const left = sessions.filter((s) => {
    const st = sessionState(s, state.now, c.monitoringDueHours);
    return st === "upcoming" || st === "in-progress" || st === "awaiting-reschedule";
  });
  return {
    contractedHours: units * perUnit,
    contractedPence: units * pay(perUnit, c.ratePence) + (c.travelPence > 0 ? sessions.length * c.travelPence : 0),
    confirmedHours: confirmed.reduce((t, l) => t + (l.hours ?? 0), 0),
    confirmedPence: lines.filter((l) => l.state === "billable").reduce((t, l) => t + l.amountPence, 0),
    sessionsLeft: left.length,
    extrasApproved: sum(extras.filter((x) => x.status === "approved")),
    extrasPending: sum(extras.filter((x) => x.status === "pending")),
  };
}

export const sessionLabel = (s: Session) => `Session ${s.n}, ${fmtDate(s.start)}`;

