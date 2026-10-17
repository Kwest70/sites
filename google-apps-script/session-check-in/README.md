# Session check-ins (Google Sheets)

Facilitators get an email shortly after each session with a personal link. The link opens a small page with two buttons:

- **Yes, it happened**: the Status cell in the sheet turns green.
- **Something changed**: tick what changed (started late, extra time, moved, cancelled, travel, other expense), fill in the detail, send.

Everything stays in Google. No new accounts, no app to install.

## What's in the sheet

| Tab | Who fills it | What it holds |
| --- | --- | --- |
| **Sessions** | The coordinator types columns A to G (facilitator, email, project, session number, date, start, end) | The script fills Status, the answer, reminder times and each session's personal link. Status turns green for *Delivered*, amber for changes, grey for cancelled, pale yellow while waiting and red if nobody has answered 24 hours after the session ended. |
| **Check-ins** | The script | Every answer, with all the detail. Nothing here is ever overwritten, so it doubles as the audit trail. |
| **Settings** | The coordinator, once | Web app link, who hears about unanswered sessions, reminder timings. |

Reminders: 15 minutes after the session ends, again at 9am the next day, then the coordinator gets an email listing anything still unanswered 24 hours after the end. All three timings can be changed in Settings.

A cancellation records who cancelled and when the facilitator was told, and the Status note says whether that was under 48 hours (payable in full) or 48 hours or more (needs a new date), following the 121 Mentor Agreement.

## Set it up (about 10 minutes)

Use the YUAF Google account the emails should come from. They are sent from whoever does these steps.

1. Create a new Google Sheet. Call it something like *Facilitator check-ins*.
2. **Extensions > Apps Script.** Delete what's in `Code.gs` and paste in [`Code.gs`](Code.gs).
3. Click **+ > HTML**, name it `CheckIn` (no `.html`), and paste in [`CheckIn.html`](CheckIn.html). Save.
4. **Deploy > New deployment.** Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy**, allow the permissions, and copy the link that ends in `/exec`.
5. Back in the sheet, reload the page. A **Check-ins** menu appears. Click **Check-ins > Set up this sheet** and allow the permissions. This creates the three tabs and the 5-minute reminder timer. Google may warn that the app isn't verified, because you made it yourself: click **Advanced**, then **Go to** the project.
6. Paste the `/exec` link into **Settings > Web app URL**. Add the coordinator's email. Run **Check-ins > Set up this sheet** once more.

### Try it

**Check-ins > Add two test sessions** adds a session that ended 20 minutes ago and one later today, with no email, so reminders come to you. Then **Check-ins > Send due reminders now**. Open the email on your phone, tap the link, tap **Yes**, and watch the Status cell go green.

## Good to know

- **Links are private.** Each row gets a random key. The page only shows that one session and never shows anyone's email.
- **Answers can be changed.** Opening the link again shows the last answer and lets the facilitator send a new one. The newest answer goes in Sessions; every answer stays in Check-ins.
- **No email?** Copy the link from the Link column and send it by text or WhatsApp yourself.
- **Daily limits.** Google's published limits are 100 email recipients a day on a personal Gmail account and 1,500 on Google Workspace. Two reminders per session fits easily.
- **If "Anyone" is missing at step 4**, a Google Workspace admin has blocked public web apps. They can allow it, or you can choose "Anyone with a Google account", in which case facilitators must be signed in to Google.
- **Changing the code later:** Deploy > Manage deployments > edit > Version: New version. The link stays the same.
