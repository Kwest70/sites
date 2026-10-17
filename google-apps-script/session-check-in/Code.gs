/**
 * Session check-ins for facilitators.
 *
 * Lives inside a Google Sheet (Extensions > Apps Script). Shortly after each
 * session the facilitator gets an email with a personal link. The link opens a
 * page with two buttons: "Yes, it happened" and "Something changed". Answers
 * land in the sheet, where the Status cell turns green.
 *
 * Tabs: Sessions (the schedule, filled in by the coordinator), Check-ins (every
 * answer, never edited) and Settings.
 */

var TAB = { sessions: "Sessions", checkIns: "Check-ins", settings: "Settings" };

var SESSION_COLS = [
  "Facilitator", "Email", "Project", "Session", "Date", "Start", "End",
  "Status", "Answered at", "What changed",
  "Reminder 1 sent", "Reminder 2 sent", "Coordinator told", "Link", "Key",
];
var C = {};
SESSION_COLS.forEach(function (h, i) { C[h] = i; });

var CHECK_IN_COLS = [
  "Submitted", "Facilitator", "Project", "Session", "Session date", "Answer",
  "Started late (min)", "Extra time (min)", "Moved to", "New start", "New end",
  "Cancelled by", "Told on", "Notice (hours)", "Travel £", "Other expense £",
  "What for", "Notes", "Key",
];

var SETTINGS = [
  ["Web app URL", "", "Paste the link ending in /exec from Deploy > Manage deployments."],
  ["Coordinator email", "", "Hears about sessions nobody has answered. Blank sends to you."],
  ["Reply-to email", "", "Where replies to the reminder email go. Blank uses your address."],
  ["Sender name", "YUAF", "Shown as the email sender."],
  ["First reminder (minutes after the session ends)", 15, ""],
  ["Second reminder (hour of the next day, 24h clock)", 9, ""],
  ["Tell the coordinator after (hours)", 24, "Counted from the end of the session."],
  ["Ignore sessions older than (days)", 7, "Stops old rows getting reminders when you first set up."],
];

var STATUS = {
  delivered: "Delivered",
  changed: "Delivered, with changes",
  moved: "Moved",
  cancelled: "Cancelled",
};

var CANCELLED_BY = {
  "young-person": "the young person",
  venue: "the venue or partner",
  yuaf: "YUAF",
  me: "the facilitator",
};

var MINUTE = 60 * 1000;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var FULL_PAY_NOTICE_HOURS = 48;

// ─── Menu and setup ─────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Check-ins")
    .addItem("Set up this sheet", "setup")
    .addItem("Send due reminders now", "runReminders")
    .addItem("Make links for new rows", "fillLinks")
    .addSeparator()
    .addItem("Add two test sessions", "addTestSessions")
    .addToUi();
}

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("Europe/London");
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", ss.getId());

  var sessions = ensureTab_(ss, TAB.sessions, SESSION_COLS);
  ensureTab_(ss, TAB.checkIns, CHECK_IN_COLS);
  var settings = ss.getSheetByName(TAB.settings) || ss.insertSheet(TAB.settings);
  if (settings.getLastRow() === 0) {
    settings.getRange(1, 1, 1, 3).setValues([["Setting", "Value", "Notes"]]).setFontWeight("bold");
    settings.getRange(2, 1, SETTINGS.length, 3).setValues(SETTINGS);
    settings.setFrozenRows(1);
    settings.autoResizeColumns(1, 3);
  }
  if (!setting_("Web app URL")) {
    var url = ScriptApp.getService().getUrl();
    if (url) setSetting_("Web app URL", url);
  }

  var rows = sessions.getMaxRows() - 1;
  sessions.getRange(2, C["Date"] + 1, rows, 1).setNumberFormat("dd/mm/yyyy");
  sessions.getRange(2, C["Start"] + 1, rows, 2).setNumberFormat("HH:mm");
  sessions.getRange(2, C["Answered at"] + 1, rows, 1).setNumberFormat("dd/mm/yyyy HH:mm");
  sessions.getRange(2, C["Reminder 1 sent"] + 1, rows, 3).setNumberFormat("dd/mm/yyyy HH:mm");
  sessions.hideColumns(C["Key"] + 1);
  colourStatus_(sessions);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "runReminders") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("runReminders").timeBased().everyMinutes(5).create();

  fillLinks();
  alert_(
    setting_("Web app URL")
      ? "Set up. Add sessions to the Sessions tab. Reminders check every 5 minutes."
      : "Nearly there. Deploy the web app, paste its /exec link into Settings, then run Set up again.",
  );
}

function ensureTab_(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** The cell you were asked for: green once the facilitator says yes. */
function colourStatus_(sheet) {
  var col = String.fromCharCode(65 + C["Status"]);
  var told = String.fromCharCode(65 + C["Coordinator told"]);
  var r1 = String.fromCharCode(65 + C["Reminder 1 sent"]);
  var range = sheet.getRange(2, C["Status"] + 1, sheet.getMaxRows() - 1, 1);
  var rule = function () { return SpreadsheetApp.newConditionalFormatRule().setRanges([range]); };
  sheet.setConditionalFormatRules([
    rule().whenTextEqualTo(STATUS.delivered).setBackground("#b7e1cd").build(),
    rule().whenTextEqualTo(STATUS.changed).setBackground("#fce8b2").build(),
    rule().whenTextEqualTo(STATUS.moved).setBackground("#fce8b2").build(),
    rule().whenTextEqualTo(STATUS.cancelled).setBackground("#e8eaed").build(),
    // No answer and the coordinator has been told: red. Reminder out, still waiting: pale yellow.
    rule().whenFormulaSatisfied("=AND($" + col + "2=\"\",$" + told + "2<>\"\")").setBackground("#f4c7c3").build(),
    rule().whenFormulaSatisfied("=AND($" + col + "2=\"\",$" + r1 + "2<>\"\")").setBackground("#fff2cc").build(),
  ]);
}

/** Gives every session row a private key and a personal link. */
function fillLinks() {
  var sheet = book_().getSheetByName(TAB.sessions);
  var last = sheet.getLastRow();
  if (last < 2) return;
  var url = setting_("Web app URL");
  var values = sheet.getRange(2, 1, last - 1, SESSION_COLS.length).getValues();
  var changed = false;
  var out = values.map(function (r) {
    var key = r[C["Key"]];
    if (!r[C["Facilitator"]] && !r[C["Date"]]) return [r[C["Link"]], key];
    if (!key) {
      key = Utilities.getUuid().replace(/-/g, "").slice(0, 16);
      changed = true;
    }
    var link = url ? url + "?k=" + key : "";
    if (link !== r[C["Link"]]) changed = true;
    return [link, key];
  });
  // Write only the two script-owned columns, so edits elsewhere are never overwritten.
  if (changed) sheet.getRange(2, C["Link"] + 1, out.length, 2).setValues(out);
}

/** Two sessions for your own email: one just finished, one later today. */
function addTestSessions() {
  var sheet = book_().getSheetByName(TAB.sessions);
  var tz = book_().getSpreadsheetTimeZone();
  var now = new Date();
  var at = function (offsetMinutes) {
    return Utilities.formatDate(new Date(now.getTime() + offsetMinutes * MINUTE), tz, "HH:mm");
  };
  var today = Utilities.formatDate(now, tz, "dd/MM/yyyy");
  sheet.appendRow(["Test Facilitator", "", "Test project", 1, today, at(-140), at(-20)]);
  sheet.appendRow(["Test Facilitator", "", "Test project", 2, today, at(60), at(180)]);
  fillLinks();
  alert_("Added two test sessions with no email, so reminders come to you. Run 'Send due reminders now' to get the first one.");
}

// ─── Reminders ──────────────────────────────────────────────────────────────

/** Runs every 5 minutes. Safe to run as often as you like: each email goes once. */
function runReminders() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) return;
  try {
    var cfg = config_();
    if (!cfg.url) {
      Logger.log("No web app URL in Settings yet, so no reminders sent.");
      return;
    }
    fillLinks();
    var ss = book_();
    var sheet = ss.getSheetByName(TAB.sessions);
    var tz = ss.getSpreadsheetTimeZone();
    var last = sheet.getLastRow();
    if (last < 2) return;
    var range = sheet.getRange(2, 1, last - 1, SESSION_COLS.length);
    var values = range.getValues();
    var shown = range.getDisplayValues();
    var now = new Date();
    var overdue = [];

    for (var i = 0; i < values.length; i++) {
      var r = values[i];
      if (r[C["Status"]] || !r[C["Key"]]) continue;
      var t = sessionTimes_(r, shown[i], tz);
      if (!t || now - t.end > cfg.ignoreDays * DAY) continue;
      var due = reminderTimes_(t.end, cfg, tz);
      var row = i + 2;

      if (!r[C["Reminder 1 sent"]] && now >= due.first) {
        // If we're already past the second reminder (e.g. first run after setup), send one email, not two.
        var stage = now >= due.second ? 2 : 1;
        if (sendReminder_(r, t, stage, cfg, tz)) {
          stamp_(sheet, row, "Reminder 1 sent", now);
          if (stage === 2) stamp_(sheet, row, "Reminder 2 sent", now);
        }
      } else if (r[C["Reminder 1 sent"]] && !r[C["Reminder 2 sent"]] && now >= due.second) {
        if (sendReminder_(r, t, 2, cfg, tz)) stamp_(sheet, row, "Reminder 2 sent", now);
      }
      if (!r[C["Coordinator told"]] && now >= due.escalate) overdue.push({ row: row, r: r, t: t });
    }

    if (overdue.length && sendEscalation_(overdue, cfg, tz)) {
      overdue.forEach(function (o) { stamp_(sheet, o.row, "Coordinator told", now); });
    }
  } finally {
    lock.releaseLock();
  }
}

function reminderTimes_(end, cfg, tz) {
  var first = new Date(end.getTime() + cfg.firstMinutes * MINUTE);
  var noonNextDay = new Date(parseLocal_(Utilities.formatDate(end, tz, "yyyy-MM-dd"), "12:00", tz).getTime() + DAY);
  var second = parseLocal_(Utilities.formatDate(noonNextDay, tz, "yyyy-MM-dd"), pad_(cfg.secondHour) + ":00", tz);
  var escalate = new Date(Math.max(end.getTime() + cfg.escalateHours * HOUR, second.getTime() + 2 * HOUR));
  return { first: first, second: second, escalate: escalate };
}

function sendReminder_(r, t, stage, cfg, tz) {
  var name = firstName_(r[C["Facilitator"]]);
  var when = describeWhen_(t, tz);
  var subject = (stage === 1 ? "Did session " : "Reminder: did session ") + r[C["Session"]] + " happen? (" +
    Utilities.formatDate(t.end, tz, "EEE d MMM") + ")";
  var html =
    "<p>Hi " + esc_(name) + ",</p>" +
    "<p>Did your " + esc_(r[C["Project"]]) + " session on <b>" + esc_(when) + "</b> happen as planned?</p>" +
    "<p><a href=\"" + esc_(r[C["Link"]]) + "\" style=\"display:inline-block;background:#15803d;color:#ffffff;" +
    "padding:16px 24px;font-size:16px;font-weight:bold;text-decoration:none\">Answer in 10 seconds</a></p>" +
    "<p style=\"color:#52525b;font-size:14px\">If anything changed, like a late start, extra time, travel or a " +
    "cancellation, you can tell us on the same page.</p>";
  return send_(r[C["Email"]], subject, html, cfg);
}

function sendEscalation_(overdue, cfg, tz) {
  var items = overdue.map(function (o) {
    return "<li><b>" + esc_(o.r[C["Facilitator"]]) + "</b>, " + esc_(o.r[C["Project"]]) + ", session " +
      esc_(o.r[C["Session"]]) + " (" + esc_(describeWhen_(o.t, tz)) + "). <a href=\"" + esc_(o.r[C["Link"]]) +
      "\">Their check-in link</a></li>";
  }).join("");
  var html =
    "<p>These sessions still have no answer " + cfg.escalateHours + " hours after they ended:</p><ul>" + items + "</ul>" +
    "<p>They are red in the Sessions tab. You can forward a link to the facilitator by text or WhatsApp.</p>";
  return send_(cfg.coordinator, overdue.length + " session" + (overdue.length === 1 ? "" : "s") + " not confirmed", html, cfg);
}

function send_(to, subject, html, cfg) {
  try {
    var options = { to: to || owner_(), subject: subject, htmlBody: html, name: cfg.senderName };
    if (cfg.replyTo) options.replyTo = cfg.replyTo;
    MailApp.sendEmail(options);
    return true;
  } catch (err) {
    Logger.log("Email to " + (to || owner_()) + " failed: " + err);
    return false;
  }
}

function stamp_(sheet, row, column, when) {
  sheet.getRange(row, C[column] + 1).setValue(when);
}

// ─── The facilitator's page ─────────────────────────────────────────────────

function doGet(e) {
  var key = e && e.parameter ? String(e.parameter.k || "") : "";
  var found = key ? findSession_(key) : null;
  var template = HtmlService.createTemplateFromFile("CheckIn");
  template.data = found ? publicView_(found) : null;
  return template
    .evaluate()
    .setTitle("Session check-in")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/** Called from the page. Returns plain strings only (Apps Script can't pass Dates back). */
function submitCheckIn(key, answer) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20 * 1000);
  try {
    var s = findSession_(String(key || ""));
    if (!s) throw new Error("This link doesn't match a session any more. Ask your coordinator for a new one.");
    var a = checkAnswer_(answer, s);
    var now = new Date();
    var r = s.values;

    book_().getSheetByName(TAB.checkIns).appendRow([
      now, r[C["Facilitator"]], r[C["Project"]], r[C["Session"]], s.times.start || s.times.end,
      a.asPlanned ? "Yes, as planned" : "Something changed",
      a.late || "", a.extra || "",
      a.moved ? a.moved.date : "", a.moved ? a.moved.start : "", a.moved ? a.moved.end : "",
      a.cancelled ? CANCELLED_BY[a.cancelled.by] : "", a.cancelled ? a.cancelled.told : "",
      a.cancelled ? a.cancelled.noticeHours : "",
      a.travel ? a.travel.amount : "", a.expense ? a.expense.amount : "",
      safeText_([a.travel ? "Travel: " + a.travel.what : "", a.expense ? "Expense: " + a.expense.what : ""]
        .filter(String).join("; ")),
      safeText_(a.notes), s.key,
    ]);
    s.sheet.getRange(s.row, C["Status"] + 1, 1, 3).setValues([[a.status, now, safeText_(a.summary)]]);
    return { status: a.status, summary: a.summary };
  } finally {
    lock.releaseLock();
  }
}

/** Validates what the page sent. Throws a message the facilitator can act on. */
function checkAnswer_(answer, s) {
  answer = answer || {};
  if (answer.asPlanned === true) {
    if (s.times.start && new Date() < s.times.start) throw new Error("This session hasn't started yet.");
    return { asPlanned: true, status: STATUS.delivered, summary: "As planned" };
  }

  var tz = s.tz;
  var out = { asPlanned: false };
  var parts = [];
  var minutes = function (v, label) {
    var n = Math.round(Number(v));
    if (!(n > 0 && n <= 600)) throw new Error("Enter how many minutes for '" + label + "'.");
    return n;
  };
  var money = function (v, label) {
    var n = Math.round(Number(v) * 100) / 100;
    if (!(n > 0 && n <= 1000)) throw new Error("Enter an amount in pounds for '" + label + "'.");
    return n;
  };
  var words = function (v, label) {
    var t = String(v || "").trim().slice(0, 200);
    if (!t) throw new Error("Say what the " + label + " was for.");
    return t;
  };

  if (answer.cancelled) {
    var by = answer.cancelled.by;
    if (!CANCELLED_BY[by]) throw new Error("Choose who cancelled.");
    var told = parseLocal_(answer.cancelled.toldDate, answer.cancelled.toldTime, tz);
    if (!told) throw new Error("Enter when you were told about the cancellation.");
    var start = s.times.start || s.times.end;
    var notice = Math.max(0, Math.round(((start - told) / HOUR) * 10) / 10);
    var rule = by === "me" ? "not payable" : notice < FULL_PAY_NOTICE_HOURS ? "under 48 hours: payable in full" : "48 hours or more: needs a new date";
    out.cancelled = { by: by, told: told, noticeHours: notice };
    parts.push("Cancelled by " + CANCELLED_BY[by] + ", " + notice + " hours' notice (" + rule + ")");
  } else if (answer.moved) {
    var day = String(answer.moved.date || "");
    var from = parseLocal_(day, answer.moved.start, tz);
    var to = parseLocal_(day, answer.moved.end, tz);
    if (!from || !to || to <= from) throw new Error("Enter the new date, start and end time.");
    out.moved = { date: from, start: answer.moved.start, end: answer.moved.end };
    parts.push("Moved to " + Utilities.formatDate(from, tz, "EEE d MMM") + ", " + answer.moved.start + " to " + answer.moved.end);
  } else {
    // Late starts and extra time only make sense if it happened on the day.
    if (answer.late) {
      out.late = minutes(answer.late.minutes, "Started late");
      parts.push("Started " + out.late + " min late");
    }
    if (answer.extra) {
      out.extra = minutes(answer.extra.minutes, "Extra time");
      parts.push(out.extra + " min extra time");
    }
  }
  if (answer.travel) {
    out.travel = { amount: money(answer.travel.amount, "Travel"), what: words(answer.travel.what, "travel") };
    parts.push("Travel £" + out.travel.amount.toFixed(2) + " (" + out.travel.what + ")");
  }
  if (answer.expense) {
    out.expense = { amount: money(answer.expense.amount, "Other expense"), what: words(answer.expense.what, "expense") };
    parts.push("Expense £" + out.expense.amount.toFixed(2) + " (" + out.expense.what + ")");
  }
  if (!parts.length) throw new Error("Tick at least one thing that changed.");
  out.notes = String(answer.notes || "").trim().slice(0, 1000);
  if (out.notes) parts.push("Note: " + out.notes);

  out.status = out.cancelled ? STATUS.cancelled : out.moved ? STATUS.moved : STATUS.changed;
  out.summary = parts.join("; ");
  return out;
}

function findSession_(key) {
  if (!/^[0-9a-f]{16}$/.test(key)) return null;
  var ss = book_();
  var sheet = ss.getSheetByName(TAB.sessions);
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var keys = sheet.getRange(2, C["Key"] + 1, last - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i][0] !== key) continue;
    var range = sheet.getRange(i + 2, 1, 1, SESSION_COLS.length);
    var values = range.getValues()[0];
    var tz = ss.getSpreadsheetTimeZone();
    var times = sessionTimes_(values, range.getDisplayValues()[0], tz);
    if (!times) return null;
    return { sheet: sheet, row: i + 2, key: key, values: values, times: times, tz: tz };
  }
  return null;
}

/** What the page is allowed to see: no emails, no other sessions. */
function publicView_(s) {
  var r = s.values;
  return {
    key: s.key,
    name: firstName_(r[C["Facilitator"]]),
    project: String(r[C["Project"]] || ""),
    session: String(r[C["Session"]] || ""),
    when: describeWhen_(s.times, s.tz),
    started: !s.times.start || new Date() >= s.times.start,
    status: String(r[C["Status"]] || ""),
    answeredAt: r[C["Answered at"]] instanceof Date ? Utilities.formatDate(r[C["Answered at"]], s.tz, "EEE d MMM, HH:mm") : "",
    summary: String(r[C["What changed"]] || ""),
    today: Utilities.formatDate(new Date(), s.tz, "yyyy-MM-dd"),
    now: Utilities.formatDate(new Date(), s.tz, "HH:mm"),
  };
}

/** Safe to print inside a <script> tag. */
function jsonForPage(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, "");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function book_() {
  var id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function config_() {
  var num = function (label, fallback) {
    var n = Number(setting_(label));
    return n > 0 ? n : fallback;
  };
  return {
    url: String(setting_("Web app URL") || "").trim(),
    coordinator: String(setting_("Coordinator email") || "").trim(),
    replyTo: String(setting_("Reply-to email") || "").trim(),
    senderName: String(setting_("Sender name") || "YUAF").trim(),
    firstMinutes: num("First reminder (minutes after the session ends)", 15),
    secondHour: Math.min(23, num("Second reminder (hour of the next day, 24h clock)", 9)),
    escalateHours: num("Tell the coordinator after (hours)", 24),
    ignoreDays: num("Ignore sessions older than (days)", 7),
  };
}

function setting_(label) {
  var sheet = book_().getSheetByName(TAB.settings);
  if (!sheet || sheet.getLastRow() < 2) return "";
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < rows.length; i++) if (rows[i][0] === label) return rows[i][1];
  return "";
}

function setSetting_(label, value) {
  var sheet = book_().getSheetByName(TAB.settings);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < rows.length; i++) if (rows[i][0] === label) sheet.getRange(i + 2, 2).setValue(value);
}

/** Start and end as Dates. Times are read as shown, which avoids Sheets' 1899 time-zone quirk. */
function sessionTimes_(values, shown, tz) {
  var day = dayString_(values[C["Date"]], shown[C["Date"]], tz);
  var end = day && parseLocal_(day, shown[C["End"]], tz);
  if (!end) return null;
  return { start: parseLocal_(day, shown[C["Start"]], tz), end: end };
}

function dayString_(value, shown, tz) {
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value, tz, "yyyy-MM-dd");
  var s = String(shown || value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  return m ? m[3] + "-" + pad_(m[2]) + "-" + pad_(m[1]) : null;
}

/** "18:00", "18:00:00", "6pm" or "6:30 PM" on a yyyy-MM-dd day, in the sheet's time zone. */
function parseLocal_(day, time, tz) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day || ""))) return null;
  var m = /^(\d{1,2})(?:[:.](\d{2}))?(?::\d{2})?\s*([ap])?\.?m?\.?$/i.exec(String(time || "").trim());
  if (!m) return null;
  var h = Number(m[1]);
  var min = Number(m[2] || 0);
  if (m[3]) {
    var pm = m[3].toLowerCase() === "p";
    if (h === 12) h = pm ? 12 : 0;
    else if (pm) h += 12;
  }
  if (h > 23 || min > 59) return null;
  return Utilities.parseDate(day + " " + pad_(h) + ":" + pad_(min), tz, "yyyy-MM-dd HH:mm");
}

function describeWhen_(t, tz) {
  var day = Utilities.formatDate(t.end, tz, "EEE d MMM");
  return t.start
    ? day + ", " + Utilities.formatDate(t.start, tz, "HH:mm") + " to " + Utilities.formatDate(t.end, tz, "HH:mm")
    : day + ", ending " + Utilities.formatDate(t.end, tz, "HH:mm");
}

function firstName_(full) {
  return String(full || "").trim().split(/\s+/)[0] || "there";
}

function owner_() {
  return Session.getEffectiveUser().getEmail();
}

function pad_(n) {
  return ("0" + n).slice(-2);
}

function esc_(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Stops typed text starting with = + - @ being run as a formula. */
function safeText_(v) {
  var s = String(v == null ? "" : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function alert_(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    Logger.log(message);
  }
}
