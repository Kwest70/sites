/**
 * Session check-ins for facilitators.
 *
 * Lives inside a Google Sheet (Extensions > Apps Script). Fifteen minutes after
 * each session the facilitator gets a text with two links:
 *   1. "Did it happen?"       Opening it marks the session as delivered.
 *   2. "Did anything change?" Opens a short form: late start, extra time, moved,
 *                              cancelled, travel, other expense.
 * Answers land in the sheet, where the Status cell turns green.
 *
 * Texts go automatically through Voodoo SMS. Until a Voodoo API key is added the
 * sheet runs in test mode: each text is written to the Message log, not sent.
 * WhatsApp needs a Meta business account to send automatically, so on WhatsApp
 * the coordinator gets a one-tap "Send on WhatsApp" link instead.
 *
 * Tabs: Sessions (the schedule, filled in by the coordinator), Check-ins (every
 * answer, never edited), Message log (every text sent) and Settings.
 */

var TAB = { sessions: "Sessions", checkIns: "Check-ins", log: "Message log", settings: "Settings" };

var SESSION_COLS = [
  "Facilitator", "Mobile", "Email", "Project", "Session", "Date", "Start", "End",
  "Status", "Answered at", "What changed", "Send on WhatsApp",
  "Check-in due", "Reminder due", "Coordinator told",
  "Yes link", "Change link", "Key",
];
var C = {};
SESSION_COLS.forEach(function (h, i) { C[h] = i; });

var CHECK_IN_COLS = [
  "Submitted", "Facilitator", "Project", "Session", "Session date", "Answer",
  "Started late (min)", "Extra time (min)", "Moved to", "New start", "New end",
  "Cancelled by", "Told on", "Notice (hours)", "Travel £", "Other expense £",
  "What for", "Notes", "Key",
];

var LOG_COLS = ["Time", "Sent by", "To", "Facilitator", "Session", "Which", "Message", "Texts used", "Result"];

var SETTINGS = [
  ["Web app URL", "", "Paste the link ending in /exec from Deploy > Manage deployments."],
  ["Send check-ins by", "Text", "Text, WhatsApp or Email. Text is automatic (Voodoo SMS). WhatsApp means the coordinator taps to send."],
  ["Text sender name", "YUAF", "Who the text says it's from. Up to 11 letters or numbers."],
  ["Coordinator email", "", "Hears about failed texts and unanswered sessions. Blank sends to you."],
  ["Reply-to email", "", "Where replies to emails go. Blank uses your address."],
  ["Email sender name", "YUAF", "Shown as the email sender."],
  ["Check-in due (minutes after the session ends)", 15, ""],
  ["Reminder due (hour of the next day, 24h clock)", 9, ""],
  ["Tell the coordinator after (hours)", 24, "Counted from the end of the session."],
  ["Ignore sessions older than (days)", 7, "Stops old rows being sent when you first set up."],
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
    .addItem("Check for due sessions now", "runReminders")
    .addItem("Make links for new rows", "fillLinks")
    .addSeparator()
    .addItem("Add Voodoo SMS key", "addSmsKey")
    .addItem("Send a test text", "sendTestText")
    .addItem("Add two test sessions", "addTestSessions")
    .addToUi();
}

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("Europe/London");
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", ss.getId());

  var sessions = ensureTab_(ss, TAB.sessions, SESSION_COLS);
  ensureTab_(ss, TAB.checkIns, CHECK_IN_COLS);
  ensureTab_(ss, TAB.log, LOG_COLS);
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
  // Plain text, so Sheets keeps the leading 0 of a mobile number.
  sessions.getRange(2, C["Mobile"] + 1, rows, 1).setNumberFormat("@");
  sessions.getRange(2, C["Date"] + 1, rows, 1).setNumberFormat("dd/mm/yyyy");
  sessions.getRange(2, C["Start"] + 1, rows, 2).setNumberFormat("HH:mm");
  sessions.getRange(2, C["Answered at"] + 1, rows, 1).setNumberFormat("dd/mm/yyyy HH:mm");
  sessions.getRange(2, C["Check-in due"] + 1, rows, 3).setNumberFormat("dd/mm/yyyy HH:mm");
  sessions.hideColumns(C["Key"] + 1);
  colourStatus_(sessions);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "runReminders") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("runReminders").timeBased().everyMinutes(5).create();

  fillLinks();
  alert_(
    setting_("Web app URL")
      ? "Set up. Add sessions to the Sessions tab. The sheet checks for finished sessions every 5 minutes." +
        (smsKey_() ? "" : " Texts are in test mode until you add a Voodoo SMS key: they go to the Message log, not to phones.")
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

function letter_(column) {
  return String.fromCharCode(65 + C[column]);
}

/** The cell you were asked for: green once the facilitator says yes. */
function colourStatus_(sheet) {
  var status = letter_("Status");
  var told = letter_("Coordinator told");
  var due = letter_("Check-in due");
  var range = sheet.getRange(2, C["Status"] + 1, sheet.getMaxRows() - 1, 1);
  var rule = function () { return SpreadsheetApp.newConditionalFormatRule().setRanges([range]); };
  sheet.setConditionalFormatRules([
    rule().whenTextEqualTo(STATUS.delivered).setBackground("#b7e1cd").build(),
    rule().whenTextEqualTo(STATUS.changed).setBackground("#fce8b2").build(),
    rule().whenTextEqualTo(STATUS.moved).setBackground("#fce8b2").build(),
    rule().whenTextEqualTo(STATUS.cancelled).setBackground("#e8eaed").build(),
    // No answer and the coordinator has been told: red. Check-in due, still waiting: pale yellow.
    rule().whenFormulaSatisfied("=AND($" + status + "2=\"\",$" + told + "2<>\"\")").setBackground("#f4c7c3").build(),
    rule().whenFormulaSatisfied("=AND($" + status + "2=\"\",$" + due + "2<>\"\")").setBackground("#fff2cc").build(),
  ]);
}

/**
 * Gives every session row a private key, its two links and a ready-made
 * WhatsApp message. Rewritten each run, so edits to times or names flow through.
 */
function fillLinks() {
  var ss = book_();
  var sheet = ss.getSheetByName(TAB.sessions);
  var last = sheet.getLastRow();
  if (last < 2) return;
  var tz = ss.getSpreadsheetTimeZone();
  var url = setting_("Web app URL");
  var range = sheet.getRange(2, 1, last - 1, SESSION_COLS.length);
  var values = range.getValues();
  var shown = range.getDisplayValues();

  var whatsApp = [];
  var links = values.map(function (r, i) {
    var text = SpreadsheetApp.newRichTextValue().setText("");
    if (!r[C["Facilitator"]] && !r[C["Date"]]) {
      whatsApp.push([text.build()]);
      return [r[C["Yes link"]], r[C["Change link"]], r[C["Key"]]];
    }
    var key = r[C["Key"]] || Utilities.getUuid().replace(/-/g, "").slice(0, 16);
    var yes = url ? url + "?k=" + key + "&a=yes" : "";
    var change = url ? url + "?k=" + key + "&a=change" : "";
    var t = sessionTimes_(r, shown[i], tz);
    if (yes && t) {
      text = SpreadsheetApp.newRichTextValue()
        .setText("Send on WhatsApp")
        .setLinkUrl(whatsAppUrl_(r[C["Mobile"]], checkInMessage_(r, t, tz, yes, change, false)));
    }
    whatsApp.push([text.build()]);
    return [yes, change, key];
  });
  // Write only script-owned columns, so edits elsewhere are never overwritten.
  sheet.getRange(2, C["Send on WhatsApp"] + 1, whatsApp.length, 1).setRichTextValues(whatsApp);
  sheet.getRange(2, C["Yes link"] + 1, links.length, 3).setValues(links);
}

/** Two sessions with no mobile or email: one just finished, one later today. */
function addTestSessions() {
  var sheet = book_().getSheetByName(TAB.sessions);
  var tz = book_().getSpreadsheetTimeZone();
  var now = new Date();
  var at = function (offsetMinutes) {
    return Utilities.formatDate(new Date(now.getTime() + offsetMinutes * MINUTE), tz, "HH:mm");
  };
  var today = Utilities.formatDate(now, tz, "dd/MM/yyyy");
  var row = function (n, from, to) {
    var r = SESSION_COLS.map(function () { return ""; });
    r[C["Facilitator"]] = "Test Facilitator";
    r[C["Project"]] = "Test project";
    r[C["Session"]] = n;
    r[C["Date"]] = today;
    r[C["Start"]] = from;
    r[C["End"]] = to;
    return r.slice(0, C["End"] + 1);
  };
  sheet.appendRow(row(1, at(-140), at(-20)));
  sheet.appendRow(row(2, at(60), at(180)));
  fillLinks();
  alert_("Added two test sessions. Put your own mobile in the Mobile column, then tap 'Send on WhatsApp' to send yourself the message.");
}

// ─── Due check-ins ──────────────────────────────────────────────────────────

/** Runs every 5 minutes. Safe to run as often as you like: each step happens once. */
function runReminders() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) return;
  try {
    var cfg = config_();
    if (!cfg.url) {
      Logger.log("No web app URL in Settings yet, so nothing to send.");
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
    var ready = [];
    var overdue = [];

    for (var i = 0; i < values.length; i++) {
      var r = values[i];
      if (r[C["Status"]] || !r[C["Key"]]) continue;
      var t = sessionTimes_(r, shown[i], tz);
      if (!t || now - t.end > cfg.ignoreDays * DAY) continue;
      var due = dueTimes_(t.end, cfg, tz);
      var row = i + 2;
      var stage = 0;

      if (!r[C["Check-in due"]] && now >= due.checkIn) {
        // Past both times already (e.g. first run after setup): one text, not two.
        stage = now >= due.reminder ? 2 : 1;
        stamp_(sheet, row, "Check-in due", now);
        if (stage === 2) stamp_(sheet, row, "Reminder due", now);
      } else if (r[C["Check-in due"]] && !r[C["Reminder due"]] && now >= due.reminder) {
        stage = 2;
        stamp_(sheet, row, "Reminder due", now);
      }
      if (stage) {
        var result = deliver_(r, t, stage, cfg, tz);
        if (result.coordinator) ready.push({ r: r, t: t, stage: stage, why: result.coordinator });
      }
      if (!r[C["Coordinator told"]] && now >= due.escalate) overdue.push({ row: row, r: r, t: t });
    }

    if (ready.length) emailReadyList_(ready, cfg, tz);
    if (overdue.length && emailOverdue_(overdue, cfg, tz)) {
      overdue.forEach(function (o) { stamp_(sheet, o.row, "Coordinator told", now); });
    }
  } finally {
    lock.releaseLock();
  }
}

/**
 * Sends one check-in by the chosen route. Returns { coordinator: reason } when the
 * coordinator needs to send it instead (WhatsApp, no mobile, or a failed text).
 */
function deliver_(r, t, stage, cfg, tz) {
  var l = linksFor_(r);
  if (cfg.channel === "whatsapp") return { coordinator: "send" };

  if (cfg.channel === "email") {
    if (!r[C["Email"]]) return { coordinator: "No email in the sheet" };
    var sent = emailFacilitator_(r, t, stage, cfg, tz);
    log_("Email", r[C["Email"]], r, stage, checkInMessage_(r, t, tz, l.yes, l.change, stage === 2), "", sent ? "Sent" : "Failed");
    return sent ? {} : { coordinator: "The email failed" };
  }

  // Text
  var to = ukMobile_(r[C["Mobile"]]);
  var text = smsMessage_(r, t, tz, l.yes, l.change, stage === 2);
  if (!to) {
    log_("Text", "", r, stage, text, smsSegments_(text), "Not sent: no mobile in the sheet");
    return { coordinator: "No mobile in the sheet" };
  }
  var key = smsKey_();
  if (!key) {
    log_("Text", to, r, stage, text, smsSegments_(text), "TEST MODE: not sent (no Voodoo SMS key yet)");
    return {};
  }
  var outcome = sendSms_(key, to, text, cfg.textSender);
  log_("Text", to, r, stage, text, smsSegments_(text), outcome.ok ? "Sent" : "Failed: " + outcome.error);
  return outcome.ok ? {} : { coordinator: "The text failed (" + outcome.error + ")" };
}

/**
 * Voodoo SMS REST API: POST /sendsms with a Bearer key and { to, from, msg }.
 * See https://www.voodoosms.com/api/rest/sending-sms
 */
function sendSms_(key, to, text, from) {
  try {
    var res = UrlFetchApp.fetch("https://api.voodoosms.com/sendsms", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + key },
      payload: JSON.stringify({ to: to, from: from || "YUAF", msg: text }),
      muteHttpExceptions: true,
    });
    var code = res.getResponseCode();
    if (code >= 200 && code < 300) return { ok: true };
    return { ok: false, error: "Voodoo said " + code + ": " + String(res.getContentText()).slice(0, 200) };
  } catch (err) {
    return { ok: false, error: String(err).slice(0, 200) };
  }
}

/** Short and plain (no emoji or curly quotes), so each text uses as few credits as possible. */
function smsMessage_(r, t, tz, yesLink, changeLink, reminder) {
  return [
    (reminder ? "Reminder: " : "") + "Hi " + firstName_(r[C["Facilitator"]]) + ". Session " + r[C["Session"]] + ", " +
      r[C["Project"]] + ", " + describeWhen_(t, tz) + ".",
    "Did it happen? Tap to confirm:",
    yesLink,
    "Did anything change? Only tap if so:",
    changeLink,
  ].join("\n");
}

/** How many texts a message is billed as: 160 characters, or 153 each when split. */
function smsSegments_(text) {
  var gsm = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-.\/:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\\[~\]|€]*$/.test(text);
  var single = gsm ? 160 : 70;
  var part = gsm ? 153 : 67;
  return text.length <= single ? 1 : Math.ceil(text.length / part);
}

function log_(by, to, r, stage, message, segments, result) {
  var sheet = book_().getSheetByName(TAB.log);
  if (!sheet) return;
  sheet.appendRow([
    new Date(), by, to ? "'" + to : "", r[C["Facilitator"]], r[C["Session"]],
    stage === 2 ? "Reminder" : stage === 0 ? "Test" : "Check-in", message, segments, result,
  ]);
}

function smsKey_() {
  return PropertiesService.getScriptProperties().getProperty("VOODOO_SMS_KEY") || "";
}

/** Menu: stores the Voodoo key out of sight, in the script's properties, not in a cell. */
function addSmsKey() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt(
    "Voodoo SMS key",
    "Paste the API key from Voodoo SMS (Send SMS > API SMS > RESTful API). Leave blank to go back to test mode.",
    ui.ButtonSet.OK_CANCEL,
  );
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  saveSmsKey_(answer.getResponseText());
  ui.alert(smsKey_() ? "Saved. Texts will now be sent for real." : "Key removed. Texts are in test mode again.");
}

function saveSmsKey_(key) {
  var props = PropertiesService.getScriptProperties();
  key = String(key || "").trim();
  if (key) props.setProperty("VOODOO_SMS_KEY", key);
  else props.deleteProperty("VOODOO_SMS_KEY");
}

/** Menu: sends one sample text to a number you type, to prove the key works. */
function sendTestText() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt("Send a test text", "Which mobile should get it? For example 07700 900123.", ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  ui.alert(testText_(answer.getResponseText()));
}

function testText_(mobile) {
  var to = ukMobile_(mobile);
  if (!to) return "That doesn't look like a mobile number.";
  var text = "Test from the YUAF check-in sheet. If you got this, texts are working.";
  var key = smsKey_();
  var fake = { length: 0 };
  fake[C["Facilitator"]] = "Test";
  fake[C["Session"]] = "-";
  if (!key) {
    log_("Text", to, fake, 0, text, smsSegments_(text), "TEST MODE: not sent (no Voodoo SMS key yet)");
    return "No Voodoo SMS key yet, so nothing was sent. Add one from Check-ins > Add Voodoo SMS key.";
  }
  var outcome = sendSms_(key, to, text, config_().textSender);
  log_("Text", to, fake, 0, text, smsSegments_(text), outcome.ok ? "Sent" : "Failed: " + outcome.error);
  return outcome.ok ? "Sent. Check the phone." : "It didn't send. " + outcome.error;
}

function dueTimes_(end, cfg, tz) {
  var checkIn = new Date(end.getTime() + cfg.checkInMinutes * MINUTE);
  var noonNextDay = new Date(parseLocal_(Utilities.formatDate(end, tz, "yyyy-MM-dd"), "12:00", tz).getTime() + DAY);
  var reminder = parseLocal_(Utilities.formatDate(noonNextDay, tz, "yyyy-MM-dd"), pad_(cfg.reminderHour) + ":00", tz);
  var escalate = new Date(Math.max(end.getTime() + cfg.escalateHours * HOUR, reminder.getTime() + 2 * HOUR));
  return { checkIn: checkIn, reminder: reminder, escalate: escalate };
}

/** The message the facilitator gets, by WhatsApp, text or email. */
function checkInMessage_(r, t, tz, yesLink, changeLink, reminder) {
  return [
    (reminder ? "Reminder: " : "") + "Hi " + firstName_(r[C["Facilitator"]]) + ". Session " + r[C["Session"]] + ", " +
      r[C["Project"]] + ", " + describeWhen_(t, tz) + ".",
    "",
    "Did it happen? Tap to confirm:",
    yesLink,
    "",
    "Did anything change? Only tap this if something was different, like a late start, extra time, travel or a cancellation:",
    changeLink,
  ].join("\n");
}

/** A wa.me link that opens WhatsApp with the message ready. Someone still presses send. */
function whatsAppUrl_(mobile, message) {
  var number = ukMobile_(mobile);
  return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
}

/** "07700 900123", "+44 7700 900123" or 7700900123 (Sheets dropped the 0) → "447700900123". */
function ukMobile_(value) {
  var d = String(value == null ? "" : value).replace(/\D/g, "");
  if (!d) return "";
  if (d.indexOf("00") === 0) d = d.slice(2);
  else if (d.indexOf("0") === 0) d = "44" + d.slice(1);
  else if (d.length === 10 && d.charAt(0) === "7") d = "44" + d;
  return d;
}

function linksFor_(r) {
  return { yes: r[C["Yes link"]], change: r[C["Change link"]] };
}

function emailFacilitator_(r, t, stage, cfg, tz) {
  var l = linksFor_(r);
  var subject = (stage === 1 ? "Did session " : "Reminder: did session ") + r[C["Session"]] + " happen? (" +
    Utilities.formatDate(t.end, tz, "EEE d MMM") + ")";
  var button = function (href, label, colour) {
    return "<p><a href=\"" + esc_(href) + "\" style=\"display:inline-block;background:" + colour +
      ";color:#ffffff;padding:16px 24px;font-size:16px;font-weight:bold;text-decoration:none\">" + label + "</a></p>";
  };
  var html =
    "<p>Hi " + esc_(firstName_(r[C["Facilitator"]])) + ",</p>" +
    "<p>Session " + esc_(r[C["Session"]]) + ", " + esc_(r[C["Project"]]) + ", <b>" + esc_(describeWhen_(t, tz)) + "</b>.</p>" +
    "<p>Did it happen? Tap to confirm:</p>" + button(l.yes, "Yes, it happened", "#15803d") +
    "<p>Did anything change? Only tap this if something was different:</p>" + button(l.change, "Something changed", "#2d0054");
  return send_(r[C["Email"]], subject, html, cfg);
}

function emailReadyList_(ready, cfg, tz) {
  var items = ready.map(function (x) {
    var l = linksFor_(x.r);
    var link = whatsAppUrl_(x.r[C["Mobile"]], checkInMessage_(x.r, x.t, tz, l.yes, l.change, x.stage === 2));
    return "<li style=\"margin-bottom:16px\"><b>" + esc_(x.r[C["Facilitator"]]) + "</b>, session " + esc_(x.r[C["Session"]]) +
      " (" + esc_(describeWhen_(x.t, tz)) + ")" + (x.stage === 2 ? ", still no answer" : "") +
      (x.why && x.why !== "send" ? ". " + esc_(x.why) : "") +
      "<br><a href=\"" + esc_(link) + "\">" + (x.stage === 2 ? "Send reminder on WhatsApp" : "Send on WhatsApp") + "</a></li>";
  }).join("");
  var automatic = ready.every(function (x) { return x.why && x.why !== "send"; });
  var html =
    (automatic
      ? "<p>These check-ins couldn't go out automatically. Tap each link to send it on WhatsApp instead.</p>"
      : "<p>Tap each link to open WhatsApp with the check-in message ready, then press send.</p>") +
    "<ul>" + items + "</ul>";
  var subject = automatic
    ? ready.length + " check-in" + (ready.length === 1 ? "" : "s") + " couldn't be sent automatically"
    : ready.length + " check-in" + (ready.length === 1 ? "" : "s") + " ready to send on WhatsApp";
  return send_(cfg.coordinator, subject, html, cfg);
}

function emailOverdue_(overdue, cfg, tz) {
  var items = overdue.map(function (o) {
    var l = linksFor_(o.r);
    return "<li><b>" + esc_(o.r[C["Facilitator"]]) + "</b>, " + esc_(o.r[C["Project"]]) + ", session " +
      esc_(o.r[C["Session"]]) + " (" + esc_(describeWhen_(o.t, tz)) + "). <a href=\"" +
      esc_(whatsAppUrl_(o.r[C["Mobile"]], checkInMessage_(o.r, o.t, tz, l.yes, l.change, true))) + "\">Chase on WhatsApp</a></li>";
  }).join("");
  var html =
    "<p>These sessions still have no answer " + cfg.escalateHours + " hours after they ended:</p><ul>" + items + "</ul>" +
    "<p>They are red in the Sessions tab.</p>";
  return send_(cfg.coordinator, overdue.length + " session" + (overdue.length === 1 ? "" : "s") + " not confirmed", html, cfg);
}

function send_(to, subject, html, cfg) {
  try {
    var options = { to: to || owner_(), subject: subject, htmlBody: html, name: cfg.emailSenderName };
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

/** ?k=key&a=yes confirms the session; ?k=key&a=change opens the form. */
function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  var key = String(p.k || "");
  var found = key ? findSession_(key) : null;
  var template = HtmlService.createTemplateFromFile("CheckIn");
  template.data = found ? publicView_(found, p.a === "yes" || p.a === "change" ? p.a : "") : null;
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
    var r = s.values;
    // The yes link never overwrites an answer already given, e.g. changes sent first.
    if (answer && answer.asPlanned === true && r[C["Status"]] && answer.replace !== true) {
      return { status: String(r[C["Status"]]), summary: String(r[C["What changed"]] || ""), already: true };
    }
    var a = checkAnswer_(answer, s);
    var now = new Date();

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

/** What the page is allowed to see: no phone numbers or emails, no other sessions. */
function publicView_(s, mode) {
  var r = s.values;
  return {
    key: s.key,
    mode: mode,
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
  var channel = String(setting_("Send check-ins by") || "Text").trim().toLowerCase();
  return {
    url: String(setting_("Web app URL") || "").trim(),
    channel: channel.indexOf("whats") === 0 ? "whatsapp" : channel.indexOf("email") === 0 ? "email" : "text",
    textSender: String(setting_("Text sender name") || "YUAF").replace(/[^A-Za-z0-9 ]/g, "").slice(0, 11) || "YUAF",
    coordinator: String(setting_("Coordinator email") || "").trim(),
    replyTo: String(setting_("Reply-to email") || "").trim(),
    emailSenderName: String(setting_("Email sender name") || "YUAF").trim(),
    checkInMinutes: num("Check-in due (minutes after the session ends)", 15),
    reminderHour: Math.min(23, num("Reminder due (hour of the next day, 24h clock)", 9)),
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
