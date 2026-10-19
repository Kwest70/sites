# Session check-ins (Google Sheets + automatic texts)

Fifteen minutes after each session the facilitator gets a text with two links. Nobody has to press send.

```
Hi Kai. Session 4, 121 Creative Development, Thu 22 Oct, 18:00 to 20:00.
Did it happen? Tap to confirm:
https://script.google.com/…/exec?k=…&a=yes
Did anything change? Only tap if so:
https://script.google.com/…/exec?k=…&a=change
```

- **Link 1** marks the session as delivered the moment it opens. No button to press. The Status cell in the sheet turns green.
- **Link 2** opens a short form: started late, ran over, moved, cancelled, travel, other expense. A detail box appears only for what they tick. If nothing changed, they never open it.

If there's no answer, a reminder text goes at 9am the next day. After 24 hours with no answer the row goes red and the coordinator gets an email.

Everything runs in Google. Texts go through **Voodoo SMS**, which YUAF already uses for participant reminders. No Meta account.

## How texts are sent

| Setting: *Send check-ins by* | What happens |
| --- | --- |
| **Text** (default) | Sent automatically through Voodoo SMS. Until a Voodoo key is added, the sheet is in **test mode**: each text is written to the **Message log** tab and nothing reaches a phone. |
| **WhatsApp** | WhatsApp can't be sent automatically without a Meta business account, so the coordinator gets an email with a one-tap **Send on WhatsApp** link for each session. |
| **Email** | Sent automatically to the facilitator's email. |

Whatever the setting, if a text can't go (no mobile in the sheet, or Voodoo refuses it), the coordinator gets an email with a **Send on WhatsApp** link for that session instead. A failed text isn't retried, so nobody gets duplicates.

**Cost:** each check-in is about 420 characters because of the two links, so Voodoo bills it as 3 texts. Voodoo's own pages list between 2.9p and 3.5p per text, so roughly 9p to 11p per check-in. Check your account for the current rate.

## What's in the sheet

| Tab | Who fills it | What it holds |
| --- | --- | --- |
| **Sessions** | The coordinator types columns A to H: facilitator, mobile, email (optional), project, session number, date, start, end | The script fills in Status, the answer, a **Send on WhatsApp** link and both personal links. Status turns green for *Delivered*, amber for changes, grey for cancelled, pale yellow once the check-in has gone and red if there's no answer 24 hours after the session ended. |
| **Check-ins** | The script | Every answer, with all the detail. Nothing here is ever overwritten, so it's the audit trail. |
| **Message log** | The script | Every text: when, to whom, the exact words, how many texts it used, and whether it was sent. |
| **Settings** | The coordinator, once | Web app link, how to send, sender name, coordinator email and timings. |

A cancellation records who cancelled and when the facilitator was told. The Status note says whether that was under 48 hours (payable in full) or 48 hours or more (needs a new date), following the 121 Mentor Agreement.

## Set it up (about 15 minutes)

This makes its own new sheet. It never touches any other spreadsheet, so use it as the test sheet.

1. Create a new Google Sheet, for example *Check-ins TEST*.
2. **Extensions > Apps Script.** Delete what's in `Code.gs` and paste in [`Code.gs`](Code.gs).
3. Click **+ > HTML**, name it `CheckIn` (no `.html`), and paste in [`CheckIn.html`](CheckIn.html). Save.
4. **Deploy > New deployment.** Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy**, allow the permissions, and copy the link that ends in `/exec`.
5. Back in the sheet, reload the page. A **Check-ins** menu appears. Click **Check-ins > Set up this sheet** and allow the permissions. Google may warn that the app isn't verified, because you made it yourself: click **Advanced**, then **Go to** the project.
6. Paste the `/exec` link into **Settings > Web app URL** and add the coordinator's email. Run **Check-ins > Set up this sheet** once more.

You're now in test mode.

### Try it in test mode

1. **Check-ins > Add two test sessions.** One ended 20 minutes ago, one is later today.
2. Put your own mobile in the **Mobile** column of the first one.
3. **Check-ins > Check for due sessions now.** The text appears in the **Message log** tab, marked *TEST MODE*.
4. Copy link 1 from the Sessions tab into your phone's browser and watch the Status cell go green. Try link 2 for the form.

### Go live

1. In Voodoo SMS, get the API key from **Send SMS > API SMS > RESTful API**.
2. **Check-ins > Add Voodoo SMS key** and paste it. The key is stored in the script's private settings, not in a cell anyone can see.
3. **Check-ins > Send a test text** to your own mobile to prove it works.

To go back to test mode, run **Add Voodoo SMS key** again and leave it blank.

## Good to know

- **Links are private.** Each row gets a random key. The page only shows that one session and never shows a phone number or email.
- **Tapping link 1 twice, or after link 2, is safe.** It never overwrites an answer already given. Opening either link again shows the last answer and lets them change it.
- **Mobile numbers** can be typed as `07700 900123`, `+44 7700 900123`, or even with the leading 0 dropped by Sheets.
- **Sender name.** Texts say they're from "YUAF" (Settings > Text sender name, up to 11 letters or numbers). Check in Voodoo that the name is allowed on your account.
- **Link previews.** The page records "yes" with JavaScript after it opens, so a phone building a link preview shouldn't mark anything delivered. Check this on the first live test.
- **Daily email limits.** Google allows 100 email recipients a day on a personal Gmail account and 1,500 on Google Workspace. The coordinator emails are batched, so this is well within either.
- **If "Anyone" is missing at step 4**, a Google Workspace admin has blocked public web apps. They can allow it, or choose "Anyone with a Google account", in which case facilitators must be signed in to Google.
- **Changing the code later:** Deploy > Manage deployments > edit > Version: New version. The links stay the same.
