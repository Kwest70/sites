"use client";

import { useMemo, useState } from "react";
import { reduce, type Action, noticeText } from "@/lib/tracker/actions";
import {
  FULL_PAY_NOTICE_HOURS,
  contractOf,
  draftPeriodFor,
  ledger,
  money,
  periodInfo,
  periodOf,
  sessionState,
} from "@/lib/tracker/rules";
import { HOUR, fmtDate, fmtTime, fromInputs, toDateInput, toTimeInput } from "@/lib/tracker/time";
import type { CancelBy } from "@/lib/tracker/types";
import { useTracker } from "./store";
import { Button, Field, Modal, inputClass } from "./ui";

type Kind = "late" | "missed" | "move" | "cancel" | "hours" | "travel" | "expense";

const KIND_LABEL: Record<Kind, string> = {
  late: "Facilitator arrived late",
  missed: "Session didn't go ahead",
  move: "Moved to another date",
  cancel: "Cancelled: record the notice given",
  hours: "Extra hours worked",
  travel: "Travel not in the contract",
  expense: "Other expense",
};

export function ChangeDialog({
  contractId,
  sessionId: initialSession,
  onClose,
}: {
  contractId: string;
  sessionId?: string;
  onClose: () => void;
}) {
  const { state, dispatch, actor } = useTracker();
  const c = contractOf(state, contractId);
  const sessions = state.sessions.filter((s) => s.contractId === contractId).sort((a, b) => a.n - b.n);
  const [sessionId, setSessionId] = useState(initialSession ?? "");
  const session = sessions.find((s) => s.id === sessionId);
  const st = session ? sessionState(session, state.now, c.monitoringDueHours) : null;

  const kinds = useMemo<Kind[]>(() => {
    const extras: Kind[] = ["hours", "travel", "expense"];
    if (!session || !st) return extras;
    if (st === "awaiting-reschedule") return ["move"];
    if (st === "missed" || st === "cancelled-paid" || st === "cancelled-unpaid") return extras;
    const started = state.now >= session.start;
    const list: Kind[] = [];
    if (started) list.push("late", "missed");
    if (st !== "delivered") list.push("move");
    if (state.role === "coordinator" && st !== "delivered") list.push("cancel");
    return [...list, ...extras];
  }, [session, st, state.now, state.role]);

  const [kind, setKind] = useState<Kind>(kinds[0]);
  const activeKind = kinds.includes(kind) ? kind : kinds[0];

  const [minutes, setMinutes] = useState(String(session?.lateMinutes || 15));
  const [date, setDate] = useState(session ? toDateInput(session.start) : toDateInput(state.now));
  const [from, setFrom] = useState(session ? toTimeInput(session.start) : "18:00");
  const [to, setTo] = useState(session ? toTimeInput(session.end) : "20:00");
  const [cancelBy, setCancelBy] = useState<CancelBy>("young-person");
  const [noticeDate, setNoticeDate] = useState(toDateInput(state.now));
  const [noticeTime, setNoticeTime] = useState(toTimeInput(state.now));
  const [hours, setHours] = useState("1");
  const [amount, setAmount] = useState("");
  const [text, setText] = useState("");

  const action: Action | null = useMemo(() => {
    const reason = text.trim();
    if (!reason) return null;
    const by = actor;
    switch (activeKind) {
      case "late": {
        const m = Math.round(Number(minutes));
        if (!session || !(m > 0) || m > c.deliveryHours * session.units * 60) return null;
        return { type: "late", sessionId: session.id, minutes: m, by, reason };
      }
      case "missed":
        return session ? { type: "missed", sessionId: session.id, by, reason } : null;
      case "move": {
        const start = fromInputs(date, from);
        const end = fromInputs(date, to);
        if (!session || start === null || end === null || end <= start) return null;
        return { type: "move", sessionId: session.id, start, end, by, reason };
      }
      case "cancel": {
        const noticeAt = fromInputs(noticeDate, noticeTime);
        if (!session || noticeAt === null) return null;
        return { type: "cancel", sessionId: session.id, cancelBy, noticeAt: Math.min(noticeAt, session.start), by, reason };
      }
      case "hours": {
        const h = Number(hours);
        if (!(h > 0) || h > 12) return null;
        return {
          type: "addExtra",
          by,
          extra: { contractId, sessionId: session?.id, kind: "hours", hours: h, date: session?.end ?? state.now, description: reason },
        };
      }
      case "travel":
      case "expense": {
        const pence = Math.round(Number(amount) * 100);
        if (!(pence > 0)) return null;
        return {
          type: "addExtra",
          by,
          extra: { contractId, sessionId: session?.id, kind: activeKind, amountPence: pence, date: session?.start ?? state.now, description: reason },
        };
      }
    }
  }, [activeKind, actor, amount, c.deliveryHours, cancelBy, contractId, date, from, hours, minutes, noticeDate, noticeTime, session, state.now, text, to]);

  const preview = useMemo(() => {
    if (!action) return null;
    const after = reduce(state, action);
    const before = draftPeriodFor(state, contractId);
    const beforeTotal = ledger(state, contractId, before, "draft").totalPence;
    const afterTotal = ledger(after, contractId, before, "draft").totalPence;
    const lines: string[] = [];
    if (action.type === "addExtra") {
      lines.push("This goes to the coordinator for approval. Once approved it joins the next pro-forma.");
      return lines;
    }
    if (afterTotal !== beforeTotal)
      lines.push(`${periodInfo(before).label} pro-forma: ${money(beforeTotal)} → ${money(afterTotal)}`);
    else lines.push(`${periodInfo(before).label} pro-forma stays at ${money(beforeTotal)}.`);
    if (session && action.type === "move") {
      const p1 = periodOf(session.start);
      const p2 = periodOf(action.start);
      if (p1 !== p2) lines.push(`Moves the session from the ${periodInfo(p1).month} period into ${periodInfo(p2).month}.`);
    }
    if (session && action.type === "cancel") {
      const notice = session.start - action.noticeAt;
      lines.push(
        action.cancelBy === "facilitator"
          ? "Cancelled by the facilitator, so it isn't payable."
          : notice < FULL_PAY_NOTICE_HOURS * HOUR
            ? `${noticeText(notice)} is under 48 hours, so it is paid in full.`
            : `${noticeText(notice)} is 48 hours or more, so it needs a new date before it is invoiced.`,
      );
    }
    const issued = session && state.proformas.find((p) => p.contractId === contractId && p.period === periodOf(session.start));
    if (issued) lines.push(`${issued.number} already covers this session, so any difference carries to the next pro-forma.`);
    return lines;
  }, [action, contractId, session, state]);

  const save = () => {
    if (!action) return;
    dispatch(action);
    onClose();
  };

  return (
    <Modal title={session ? `Change to session ${session.n}` : "Log extra hours or an expense"} onClose={onClose}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {!initialSession && (
          <Field label="Session (optional)">
            {(id) => (
              <select id={id} className={inputClass} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">Not linked to a session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session {s.n}: {fmtDate(s.start)}, {fmtTime(s.start)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">What changed?</legend>
          {kinds.map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="radio" name="kind" checked={activeKind === k} onChange={() => setKind(k)} />
              {k === "move" && st === "awaiting-reschedule" ? "Give it a new date" : KIND_LABEL[k]}
            </label>
          ))}
        </fieldset>

        {activeKind === "late" && (
          <Field label="Minutes late" hint="Taken off the paid delivery time.">
            {(id) => (
              <input id={id} type="number" min={1} step={1} className={inputClass} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            )}
          </Field>
        )}

        {activeKind === "move" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="New date">
              {(id) => <input id={id} type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />}
            </Field>
            <Field label="Starts">
              {(id) => <input id={id} type="time" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />}
            </Field>
            <Field label="Ends">
              {(id) => <input id={id} type="time" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />}
            </Field>
          </div>
        )}

        {activeKind === "cancel" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Cancelled by">
              {(id) => (
                <select id={id} className={inputClass} value={cancelBy} onChange={(e) => setCancelBy(e.target.value as CancelBy)}>
                  <option value="young-person">Young person</option>
                  <option value="partner">Partner or venue</option>
                  <option value="yuaf">YUAF</option>
                  <option value="facilitator">Facilitator</option>
                </select>
              )}
            </Field>
            <Field label="Notice given on">
              {(id) => <input id={id} type="date" className={inputClass} value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} />}
            </Field>
            <Field label="At">
              {(id) => <input id={id} type="time" className={inputClass} value={noticeTime} onChange={(e) => setNoticeTime(e.target.value)} />}
            </Field>
          </div>
        )}

        {activeKind === "hours" && (
          <Field label="Extra hours" hint={`Paid at the contract rate of ${money(c.ratePence)} an hour once approved.`}>
            {(id) => (
              <input id={id} type="number" min={0.25} step={0.25} className={inputClass} value={hours} onChange={(e) => setHours(e.target.value)} />
            )}
          </Field>
        )}

        {(activeKind === "travel" || activeKind === "expense") && (
          <Field label="Amount (£)" hint="Keep the receipt. Finance may ask for it.">
            {(id) => (
              <input id={id} type="number" min={0.01} step={0.01} inputMode="decimal" className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
            )}
          </Field>
        )}

        <Field label={activeKind === "hours" || activeKind === "travel" || activeKind === "expense" ? "What was it for?" : "Reason"}>
          {(id) => (
            <textarea id={id} rows={2} className={inputClass} value={text} onChange={(e) => setText(e.target.value)} />
          )}
        </Field>

        {preview && (
          <div className="border-l-2 border-primary bg-surface-muted p-2 text-sm">
            <div className="mb-1 font-medium">What this does</div>
            <ul className="flex flex-col gap-1">
              {preview.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!action}>
            Save change
          </Button>
        </div>
      </form>
    </Modal>
  );
}
