# Session check-ins (Google Sheets + WhatsApp)

After each session the facilitator gets one WhatsApp message with two links:

```
Hi Kai. Session 4, 121 Creative Development, Thu 22 Oct, 18:00 to 20:00.

Did it happen? Tap to confirm:
https://script.google.com/…/exec?k=…&a=yes

Did anything change? Only tap this if something was different, like a late start, extra time, travel or a cancellation:
https://script.google.com/…/exec?k=…&a=change
```

- **Link 1** marks the session as delivered the moment it opens. No button to press. The Status cell in the sheet turns green.
- **Link 2** opens a short form: started late, ran over, moved, cancelled, travel, other expense. A detail box appears only for what they tick. If nothing changed, they never open it.

Everything stays in Google. No Meta account, no app to install.

## Sending on WhatsApp

WhatsApp can't be sent automatically without a Meta business account, so the sheet does everything except press send:

1. Fifteen minutes after a session ends, the coordinator gets an email listing it, with a **Send on WhatsApp** link. The same link is in the session's row.
2. Tapping it opens WhatsApp with the message already written, addressed to the facilitator's mobile.
3. Press send.

If there's still no answer at 9am the next day, the coordinator gets a **Send reminder on WhatsApp** link. After 24 hours with no answer the row goes red and the coordinator gets a **Chase on WhatsApp** link.

You can also send the message before the session, for example that morning. Link 1 won't count until the session has started, and link 2 works any time, so a facilitator can report a cancellation in advance.

## What's in the sheet

| Tab | Who fills it | What it holds |
| --- | --- | --- |
| **Sessions** | The coordinator types columns A to H: facilitator, mobile, email (optional), project, session number, date, start, end | The script fills in Status, the answer, a **Send on WhatsApp** link and both personal links. Status turns green for *Delivered*, amber for changes, grey for cancelled, pale yellow once the check-in is due and red if there's no answer 24 hours after the session ended. |
| **Check-ins** | The script | Every answer, with all the detail. Nothing here is ever overwritten, so it's the audit trail. |
| **Settings** | The coordinator, once | Web app link, coordinator email, timings, and whether to also email facilitators (off by default). |

A cancellation records who cancelled and when the facilitator was told. The Status note says whether that was under 48 hours (payable in full) or 48 hours or more (needs a new date), following the 121 Mentor Agreement.

## Set it up (about 10 minutes)

This makes its own new sheet. It never touches any other spreadsheet, so use it as the test sheet.

Use the Google account the coordinator emails should come from.

1. Create a new Google Sheet, for example *Check-ins TEST*.
2. **Extensions > Apps Script.** Delete what's in `Code.gs` and paste in [`Code.gs`](Code.gs).
3. Click **+ > HTML**, name it `CheckIn` (no `.html`), and paste in [`CheckIn.html`](CheckIn.html). Save.
4. **Deploy > New deployment.** Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy**, allow the permissions, and copy the link that ends in `/exec`.
5. Back in the sheet, reload the page. A **Check-ins** menu appears. Click **Check-ins > Set up this sheet** and allow the permissions. Google may warn that the app isn't verified, because you made it yourself: click **Advanced**, then **Go to** the project.
6. Paste the `/exec` link into **Settings > Web app URL** and add the coordinator's email. Run **Check-ins > Set up this sheet** once more.

### Try it on yourself

1. **Check-ins > Add two test sessions.** One ended 20 minutes ago, one is later today.
2. Put your own mobile in the **Mobile** column of the first one.
3. Tap **Send on WhatsApp** in that row and send the message to yourself.
4. On your phone, tap link 1 and watch the Status cell go green. Tap link 2 to try the form.

## Good to know

- **Links are private.** Each row gets a random key. The page only shows that one session and never shows a phone number or email.
- **Tapping link 1 twice, or after link 2, is safe.** It never overwrites an answer already given. Opening either link again shows the last answer and lets them change it.
- **Mobile numbers** can be typed as `07700 900123`, `+44 7700 900123`, or even with the leading 0 dropped by Sheets.
- **Link previews.** The page records "yes" with JavaScript after it opens. WhatsApp's link preview should not run that, so sending the message shouldn't mark anything delivered. Check this on the first test.
- **Daily email limits.** Google allows 100 email recipients a day on a personal Gmail account and 1,500 on Google Workspace. Coordinator nudges are batched, so this is well within either.
- **If "Anyone" is missing at step 4**, a Google Workspace admin has blocked public web apps. They can allow it, or choose "Anyone with a Google account", in which case facilitators must be signed in to Google.
- **Changing the code later:** Deploy > Manage deployments > edit > Version: New version. The links stay the same.
