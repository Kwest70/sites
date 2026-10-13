"use client";

import { useState } from "react";
import {
  breakdown,
  contractOf,
  groupTitle,
  ledger,
  money,
  periodInfo,
  proformaNumber,
  shiftPeriod,
  type LineFlag,
} from "@/lib/tracker/rules";
import { fmtDate, fmtDateTime, fmtDateYear, fmtDay, londonParts, monthName } from "@/lib/tracker/time";
import type { ProFormaLine } from "@/lib/tracker/types";
import { cn } from "@/lib/cn";
import { useTracker } from "./store";
import { Badge, Button, Field, inputClass } from "./ui";

const ordinal = (d: number) =>
  `${d}${d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th"}`;

function longDate(ms: number) {
  const p = londonParts(ms);
  return `${ordinal(p.d)} ${monthName(p.m)} ${p.y}`;
}

interface Row {
  key: string;
  date: number;
  text: string;
  amountPence: number;
  flags: LineFlag[];
}

function rowsFromLines(state: ReturnType<typeof useTracker>["state"], lines: ProFormaLine[]): Row[] {
  const groups = new Map<string, ProFormaLine[]>();
  for (const l of lines) groups.set(l.groupKey, [...(groups.get(l.groupKey) ?? []), l]);
  return Array.from(groups.entries())
    .map(([key, ls]) => toRow(key, groupTitle(state, key), ls, ls.find((l) => l.note)?.note ?? "", []))
    .sort((a, b) => a.date - b.date);
}

function toRow(key: string, title: string, lines: ProFormaLine[], note: string, flags: LineFlag[]): Row {
  const positive = lines.every((l) => l.amountPence > 0);
  const parts = [title, positive ? breakdown(lines) : "", note].filter(Boolean);
  return {
    key,
    date: Math.min(...lines.map((l) => l.date)),
    text: parts.join(" · "),
    amountPence: lines.reduce((t, l) => t + l.amountPence, 0),
    flags,
  };
}

/** The pro-forma laid out like YUAF's template, issued or as a live draft. */
export function ProFormaDoc({ contractId, period, printable }: { contractId: string; period: string; printable?: boolean }) {
  const { state } = useTracker();
  const c = contractOf(state, contractId);
  const pf = state.proformas.find((p) => p.contractId === contractId && p.period === period);
  const info = periodInfo(period);

  let rows: Row[];
  let paidRows: { key: string; date: number; text: string; amountPence: number }[] = [];
  let number: string;
  let total: number;
  if (pf) {
    rows = rowsFromLines(state, pf.lines);
    number = pf.number;
    total = pf.totalPence;
  } else {
    const draft = ledger(state, contractId, period, "draft");
    rows = draft.groups.map((g) => toRow(g.groupKey, g.title, g.lines, g.note, g.flags));
    paidRows = draft.info.map((i) => ({ key: i.groupKey, date: i.date, text: `${i.title} · ${i.note}`, amountPence: i.amountPence }));
    number = proformaNumber(c, state.proformas.filter((p) => p.contractId === contractId).length + 1);
    total = draft.totalPence;
  }
  const lateMonitoringPay = periodInfo(shiftPeriod(period, 1)).payDate;

  return (
    <article className={cn("relative border border-subtle bg-surface p-4 text-sm md:p-8", printable && "print-area")}>
      {!pf && (
        <div className="mb-4 border border-dashed border-warning bg-warning-soft px-2 py-2 text-xs text-warning print:hidden">
          Draft. This updates live from the delivery schedule until the coordinator issues it.
        </div>
      )}
      <p className="font-medium">CONTRACT NUMBER {c.number}</p>
      <hr className="my-4 border-subtle" />
      <p className="font-medium">
        Pro-forma Invoice Number {number}
        {!pf && " (draft)"}
      </p>
      <p className="font-medium">Tax date: {longDate(info.payDate)}</p>
      <p className="mt-2">Legal name: {c.facilitator}</p>
      <p>Employment status: Self-employed. The Contractor is responsible for their own tax and National Insurance.</p>

      <dl className="mt-4 grid grid-cols-1 border-l border-t border-subtle text-xs sm:grid-cols-2">
        {["Address", "Telephone", "Postcode", "Bank account full name", "Email", "Bank sort code", "DBS certificate no.", "Bank account no."].map(
          (label) => (
            <div key={label} className="flex gap-2 border-b border-r border-subtle px-2 py-1">
              <dt className="w-40 shrink-0 font-medium uppercase">{label}</dt>
              <dd className="text-muted">From contractor record</dd>
            </div>
          ),
        )}
      </dl>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-foreground text-xs uppercase">
              <th className="w-10 py-2 pr-2 font-medium">No.</th>
              <th className="w-32 py-2 pr-2 font-medium">Date</th>
              <th className="py-2 pr-2 font-medium">Session / deliverable</th>
              <th className="w-24 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paidRows.map((r) => (
              <tr key={r.key} className="border-b border-subtle text-muted">
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2 align-top">{fmtDateYear(r.date)}</td>
                <td className="py-2 pr-2">{r.text}</td>
                <td className="py-2 text-right tabular-nums">{money(r.amountPence)} paid</td>
              </tr>
            ))}
            {rows.map((r, i) => (
              <tr key={r.key} className="border-b border-subtle align-top">
                <td className="py-2 pr-2 tabular-nums">{i + 1}.</td>
                <td className="py-2 pr-2">{fmtDateYear(r.date)}</td>
                <td className="py-2 pr-2">
                  {r.text}
                  {r.flags.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1 print:hidden">
                      {r.flags.includes("unconfirmed") && <Badge tone="warning">Not confirmed yet</Badge>}
                      {r.flags.includes("monitoring-incomplete") && (
                        <Badge tone="warning">Monitoring incomplete: pay may move to {fmtDate(lateMonitoringPay)}</Badge>
                      )}
                      {r.flags.includes("late-cancellation") && <Badge tone="info">Late cancellation, paid in full</Badge>}
                      {r.flags.includes("moved-period") && <Badge tone="info">Moved into this period</Badge>}
                    </span>
                  )}
                </td>
                <td className={cn("py-2 text-right tabular-nums", r.amountPence < 0 && "text-danger")}>{money(r.amountPence)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted">
                  Nothing due for this period.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-b border-subtle">
              <td colSpan={3} className="py-2 pr-2 font-medium">
                Pro-forma Invoice {number} | sessions up to {fmtDay(info.payDate)} {londonParts(info.payDate).y} | paid{" "}
                {fmtDateYear(info.payDate)}
              </td>
              <td className="py-2 text-right font-medium tabular-nums">{money(total)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="py-2 pr-2 font-medium">
                TOTAL DUE THIS INVOICE
              </td>
              <td className="py-2 text-right font-medium tabular-nums">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-4 font-medium">Please raise any queries with YUAF finance before the 26th of the month.</p>
      {pf && (
        <p className="mt-2 text-xs text-muted print:hidden">
          Issued {fmtDateTime(pf.issuedAt)} by {pf.issuedBy}
          {pf.agreedAt && ` · agreed by ${c.facilitator} ${fmtDateTime(pf.agreedAt)}`}
        </p>
      )}
    </article>
  );
}

/** Agree or query an issued pro-forma, as the facilitator. */
export function FacilitatorProFormaActions({ contractId, period }: { contractId: string; period: string }) {
  const { state, dispatch, actor } = useTracker();
  const pf = state.proformas.find((p) => p.contractId === contractId && p.period === period);
  const [querying, setQuerying] = useState(false);
  const [text, setText] = useState("");
  const info = periodInfo(period);

  if (!pf) {
    return (
      <p className="text-sm text-muted">
        YUAF issues this around the 20th. You then have until {fmtDate(info.queryDeadline)} to raise a query. Turn your cells green
        so it is right first time.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {pf.agreedAt ? (
          <Badge tone="success">You agreed this on {fmtDate(pf.agreedAt)}</Badge>
        ) : (
          <Button variant="success" onClick={() => dispatch({ type: "agree", proformaId: pf.id, by: actor })}>
            Agree pro-forma
          </Button>
        )}
        {!pf.query && (
          <Button onClick={() => setQuerying((q) => !q)}>{querying ? "Cancel query" : "Raise a query"}</Button>
        )}
        {pf.query && <Badge tone="warning">Query sent {fmtDate(pf.query.at)}</Badge>}
        {pf.paid && <Badge tone="success">Paid</Badge>}
      </div>
      {querying && (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            dispatch({ type: "query", proformaId: pf.id, text: text.trim(), by: actor });
            setQuerying(false);
          }}
        >
          <Field label="What looks wrong?" hint={`Queries go to YUAF finance. Send before ${fmtDate(info.queryDeadline)}.`}>
            {(id) => <textarea id={id} rows={2} className={inputClass} value={text} onChange={(e) => setText(e.target.value)} />}
          </Field>
          <div>
            <Button type="submit" variant="primary" disabled={!text.trim()}>
              Send query
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
