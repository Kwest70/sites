export type Role = "facilitator" | "coordinator";

/** Budget lines. Each contract maps these to its own finance cost codes. */
export type CostKind = "delivery" | "admin" | "travel" | "additional" | "expenses" | "deliverable";

export interface Contract {
  id: string;
  /** e.g. 26-YoMu-AMP-JRE: year, funder, project, facilitator initials */
  number: string;
  facilitator: string;
  role: string;
  project: string;
  funder: string;
  practice?: string;
  venue: string;
  ratePence: number;
  /** Paid delivery hours per session, before any late arrival. */
  deliveryHours: number;
  /** Paid admin or monitoring hours per session. */
  adminHours: number;
  adminLabel: string;
  /** Flat travel allowance per delivered session. */
  travelPence: number;
  sessionsContracted: number;
  /** Monitoring paperwork must be in within this many hours of a session ending. */
  monitoringDueHours: number;
  costCodes: Record<CostKind, string>;
  /** Where the terms came from, shown in the UI. */
  termsSource: string;
}

export type CancelBy = "yuaf" | "partner" | "young-person" | "facilitator";

export type MonitoringKey = "plan" | "tracker" | "upshot" | "upload";

export interface Session {
  id: string;
  contractId: string;
  n: number;
  /** 2 for a double session paid as two sessions. */
  units: number;
  /** As first contracted, so moves can be measured against the budget. */
  plannedStart: number;
  plannedEnd: number;
  start: number;
  end: number;
  /** Set when the facilitator turns the cell green. */
  confirmedAt?: number;
  missed?: boolean;
  lateMinutes: number;
  cancellation?: { by: CancelBy; noticeAt: number };
  monitoring: Record<MonitoringKey, boolean>;
}

export type ExtraKind = "hours" | "travel" | "expense" | "deliverable";
export type Decision = "pending" | "approved" | "rejected";

/** Anything outside the session pattern: extra hours, expenses, one-off deliverables. */
export interface Extra {
  id: string;
  contractId: string;
  sessionId?: string;
  kind: ExtraKind;
  date: number;
  hours?: number;
  amountPence?: number;
  description: string;
  status: Decision;
  loggedBy: string;
  loggedAt: number;
}

export type ChangeType =
  | "confirmed"
  | "unconfirmed"
  | "moved"
  | "late"
  | "missed"
  | "cancelled"
  | "rescheduled"
  | "extra"
  | "approved"
  | "rejected"
  | "issued"
  | "agreed"
  | "query"
  | "paid";

export interface ChangeEntry {
  id: string;
  at: number;
  by: string;
  contractId: string;
  sessionId?: string;
  type: ChangeType;
  summary: string;
  reason?: string;
  /** Money effect on what the facilitator is owed, in pence. */
  deltaPence?: number;
  fromPeriod?: string;
  toPeriod?: string;
}

export interface ProFormaLine {
  /** Ledger key, e.g. "s-jr-3:delivery". The same key across pro-formas nets off. */
  key: string;
  groupKey: string;
  kind: CostKind;
  costCode: string;
  date: number;
  description: string;
  note?: string;
  amountPence: number;
}

export interface ProForma {
  id: string;
  contractId: string;
  period: string;
  seq: number;
  number: string;
  issuedAt: number;
  issuedBy: string;
  lines: ProFormaLine[];
  totalPence: number;
  agreedAt?: number;
  query?: { at: number; text: string };
  dext: boolean;
  paid: boolean;
}

export interface TrackerState {
  version: number;
  now: number;
  live: boolean;
  role: Role;
  /** The facilitator being viewed, by contract id. */
  viewAs: string;
  contracts: Contract[];
  sessions: Session[];
  extras: Extra[];
  changes: ChangeEntry[];
  proformas: ProForma[];
  firedAlerts: string[];
}
