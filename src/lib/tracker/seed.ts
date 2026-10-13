// Demo data. Contract terms are modelled on YUAF's 121 Mentor Agreement and the
// Amplify Hillingdon pro-forma; every name, date and event is made up.

import type { Contract, Extra, ProForma, Session, TrackerState } from "./types";
import { fromLondon } from "./time";
import { reduce, type Action } from "./actions";
import { dueAlerts } from "./rules";

export const STATE_VERSION = 3;

/** Thursday evening, a few days before the October period closes. */
export const DEMO_START = fromLondon(2026, 10, 22, 20, 55);

const COORDINATOR = "Project Coordinator";

const contracts: Contract[] = [
  {
    id: "km",
    number: "26-TNL-121-KMO",
    facilitator: "Kai Morgan",
    role: "121 Creative Development Mentor",
    project: "121 Creative Development",
    funder: "The National Lottery",
    practice: "DJing",
    venue: "Mentor's own studio, Leyton",
    ratePence: 3000,
    deliveryHours: 2,
    adminHours: 1,
    adminLabel: "Admin",
    travelPence: 0,
    sessionsContracted: 6,
    monitoringDueHours: 24,
    costCodes: {
      delivery: "121-DEL",
      admin: "121-ADM",
      travel: "121-TRV",
      additional: "121-ADD",
      expenses: "121-EXP",
      deliverable: "121-DLV",
    },
    termsSource:
      "Terms from the 121 Mentor Agreement: £30 an hour, 6 sessions of 2h delivery plus 1h admin, £540 in total. The 48-hour cancellation rule and 24-hour monitoring deadline come from the same contract.",
  },
  {
    id: "jr",
    number: "26-YoMu-AMP-JRE",
    facilitator: "Jordan Reid",
    role: "Facilitator",
    project: "Amplify Hillingdon",
    funder: "Youth Music",
    practice: "Music production",
    venue: "Studio Bus, West Drayton",
    ratePence: 3000,
    deliveryHours: 3,
    adminHours: 0,
    adminLabel: "Admin",
    travelPence: 1500,
    sessionsContracted: 10,
    monitoringDueHours: 24,
    costCodes: {
      delivery: "AMP-DEL",
      admin: "AMP-ADM",
      travel: "AMP-TRV",
      additional: "AMP-ADD",
      expenses: "AMP-EXP",
      deliverable: "AMP-DLV",
    },
    termsSource:
      "Demo terms modelled on the Amplify Hillingdon pro-forma: £90 a session plus £15 travel, double sessions paid as two.",
  },
];

const blankMonitoring = { plan: false, tracker: false, upshot: false, upload: false };

function session(
  contractId: string,
  n: number,
  date: [number, number],
  from: [number, number],
  to: [number, number],
  units = 1,
): Session {
  const start = fromLondon(2026, date[0], date[1], from[0], from[1]);
  const end = fromLondon(2026, date[0], date[1], to[0], to[1]);
  return {
    id: `s-${contractId}-${n}`,
    contractId,
    n,
    units,
    plannedStart: start,
    plannedEnd: end,
    start,
    end,
    lateMinutes: 0,
    monitoring: { ...blankMonitoring },
  };
}

const kai = (n: number, d: [number, number]) => session("km", n, d, [18, 0], [20, 0]);
const jordan = (n: number, d: [number, number], units = 1) =>
  units === 2 ? session("jr", n, d, [13, 30], [19, 30], 2) : session("jr", n, d, [15, 30], [18, 30]);

const sessions: Session[] = [
  kai(1, [10, 1]),
  kai(2, [10, 8]),
  kai(3, [10, 15]),
  kai(4, [10, 22]),
  kai(5, [10, 29]),
  kai(6, [11, 5]),
  jordan(1, [9, 23]),
  jordan(2, [9, 30]),
  jordan(3, [10, 7]),
  jordan(4, [10, 14]),
  jordan(5, [10, 21]),
  jordan(6, [10, 27]),
  jordan(7, [10, 28], 2),
  jordan(8, [11, 4]),
  jordan(9, [11, 11]),
];

const brief: Extra = {
  id: "x-jr-brief",
  contractId: "jr",
  kind: "deliverable",
  date: fromLondon(2026, 9, 21, 12),
  amountPence: 1500,
  description: "Project brief",
  status: "approved",
  loggedBy: COORDINATOR,
  loggedAt: fromLondon(2026, 9, 1, 10),
};

/** Issued by hand before the tracker existed. Session 1 was left off, so it rolls forward. */
const septemberProforma: ProForma = {
  id: "pf-jr-01",
  contractId: "jr",
  period: "2026-09",
  seq: 1,
  number: "26-YoMu-AMP-JRE-01",
  issuedAt: fromLondon(2026, 9, 18, 10),
  issuedBy: COORDINATOR,
  lines: [
    {
      key: "x-jr-brief:deliverable",
      groupKey: "x-jr-brief",
      kind: "deliverable",
      costCode: "AMP-DLV",
      date: brief.date,
      description: "deliverable",
      amountPence: 1500,
    },
  ],
  totalPence: 1500,
  agreedAt: fromLondon(2026, 9, 19, 8, 30),
  dext: true,
  paid: true,
};

const at = (m: number, d: number, h: number, min = 0): Action => ({
  type: "setNow",
  now: fromLondon(2026, m, d, h, min),
});
const all = (sessionId: string): Action[] =>
  (["plan", "tracker", "upshot", "upload"] as const).map((key) => ({ type: "monitoring", sessionId, key, value: true }));

const history: Action[] = [
  at(9, 23, 19, 5),
  { type: "confirm", sessionId: "s-jr-1", by: "Jordan Reid" },
  at(9, 30, 18, 50),
  { type: "confirm", sessionId: "s-jr-2", by: "Jordan Reid" },
  at(9, 30, 19, 0),
  {
    type: "addExtra",
    by: "Jordan Reid",
    extra: {
      contractId: "jr",
      sessionId: "s-jr-2",
      kind: "hours",
      hours: 1,
      date: fromLondon(2026, 9, 30, 18, 30),
      description: "Stayed on to finish the group mix-down",
    },
  },
  at(10, 1, 20, 35),
  { type: "confirm", sessionId: "s-km-1", by: "Kai Morgan" },
  ...all("s-km-1"),
  at(10, 7, 18, 40),
  { type: "late", sessionId: "s-jr-3", minutes: 30, by: "Jordan Reid", reason: "Train delays" },
  { type: "confirm", sessionId: "s-jr-3", by: "Jordan Reid" },
  at(10, 9, 9, 20),
  { type: "confirm", sessionId: "s-km-2", by: "Kai Morgan" },
  { type: "monitoring", sessionId: "s-km-2", key: "plan", value: true },
  { type: "monitoring", sessionId: "s-km-2", key: "tracker", value: true },
  { type: "monitoring", sessionId: "s-km-2", key: "upload", value: true },
  at(10, 12, 11, 0),
  {
    type: "move",
    sessionId: "s-km-3",
    start: fromLondon(2026, 10, 17, 12),
    end: fromLondon(2026, 10, 17, 14),
    by: COORDINATOR,
    reason: "Mentee has a college open evening on Thursday",
  },
  at(10, 13, 19, 30),
  {
    type: "cancel",
    sessionId: "s-jr-4",
    cancelBy: "partner",
    noticeAt: fromLondon(2026, 10, 13, 19, 30),
    by: COORDINATOR,
    reason: "Venue closed at short notice",
  },
  at(10, 17, 14, 20),
  { type: "confirm", sessionId: "s-km-3", by: "Kai Morgan" },
  ...all("s-km-3"),
  at(10, 19, 17, 0),
  {
    type: "addExtra",
    by: "Jordan Reid",
    extra: {
      contractId: "jr",
      kind: "travel",
      amountPence: 1120,
      date: fromLondon(2026, 10, 19, 16),
      description: "Return trip to collect the PA from storage",
    },
  },
  at(10, 20, 10, 0),
  { type: "issue", contractId: "jr", period: "2026-10", by: COORDINATOR },
  at(10, 22, 9, 30),
  {
    type: "cancel",
    sessionId: "s-jr-6",
    cancelBy: "partner",
    noticeAt: fromLondon(2026, 10, 22, 9, 30),
    by: COORDINATOR,
    reason: "Partner needs the site for an event",
  },
  at(10, 22, 10, 15),
  {
    type: "cancel",
    sessionId: "s-km-5",
    cancelBy: "young-person",
    noticeAt: fromLondon(2026, 10, 22, 10, 15),
    by: COORDINATOR,
    reason: "Mentee is away on a school residential",
  },
  { type: "setNow", now: DEMO_START },
];

export function demoState(): TrackerState {
  const base: TrackerState = {
    version: STATE_VERSION,
    now: fromLondon(2026, 9, 1),
    live: false,
    role: "facilitator",
    viewAs: "km",
    contracts,
    sessions,
    extras: [brief],
    proformas: [septemberProforma],
    changes: [
      {
        id: "chg-seed-1",
        at: septemberProforma.issuedAt,
        by: COORDINATOR,
        contractId: "jr",
        type: "issued",
        summary: "Issued pro-forma 26-YoMu-AMP-JRE-01: £15.00",
        reason: "Made by hand before the tracker. Session 1 on 23 Sep was left off.",
        fromPeriod: "2026-09",
      },
    ],
    firedAlerts: [],
  };
  const state = history.reduce(reduce, base);
  // Reminders that went out before the demo starts shouldn't pop up as new.
  return { ...state, firedAlerts: dueAlerts(state).map((a) => a.id) };
}
