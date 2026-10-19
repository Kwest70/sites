# Session check-ins (Google Sheets + automatic texts)

A small system for any project and any facilitator. Paste in a contract's link, the sheet reads it and makes the sessions. Fifteen minutes after each session, the facilitator gets a text with two links. Nobody has to press send.

```
Hi Kai. Session 4, 121 Creative Development, Thu 22 Oct, 18:00 to 20:00.
Did it happen? Tap to confirm:
https://script.google.com/…/exec?k=…&a=yes
Did anything change? Only tap if so:
https://script.google.com/…/exec?k=…&a=change
```

- **Link 1** marks the session as delivered the moment it opens. No button to press. The Status cell turns green.
- **Link 2** opens a short form: started late, ran over, moved, cancelled, travel, other expense. A detail box appears only for what they tick. If nothing changed, they never open it.

If there's no answer, a reminder text goes at 9am the next day. After 24 hours with no answer the row goes red and the coordinator gets an email.

Everything runs in Google. Texts come from a spare **Android phone** running the free *SMS Gateway for Android* app. No Meta account, no monthly fee.

## The tabs

| Tab | Who fills it | What it holds |
| --- | --- | --- |
| **Contracts** | Paste the contract link; the sheet reads the rest | Contract file, notes on what's still needed, facilitator, mobile, project, role, venue, rate, hours, travel, and the session pattern: first session, repeats (weekly or fortnightly), number of sessions, any other dates, start and end time. |
| **Sessions** | Made from Contracts (you can also type rows in) | One row per session. The script fills in Status, the answer and both personal links. Status turns green for *Delivered*, amber for changes, grey for cancelled, pale yellow once the check-in has gone and red if there's no answer 24 hours after the session ended. Move a session by editing its date or time here. |
| **Check-ins** | The script | Every answer, with all the detail. Nothing here is ever overwritten, so it's the audit trail. |
| **Message log** | The script | Every text: when, to whom, the exact words, how many texts it used, and whether it was sent. |
| **Settings** | The coordinator, once | How to send, phone hours, coordinator email and timings. |

### Adding a contract

1. Paste the contract's Google Drive link into the first column (**Contract file**) of a new row on the **Contracts** tab.
2. Within 5 minutes the sheet reads the contract's **Key Terms** table and fills in the row. Use **Check-ins > Read new contracts** to do it straight away.
3. The **Contract notes** column says what's still needed, for example *Still needed: mobile, session dates, start and end times*. Add those.
4. **Check-ins > Make sessions from new contracts.**

**Best format: a Google Doc** with this Key Terms table. Then the sheet reads everything and nothing needs typing:

| | | | |
| --- | --- | --- | --- |
| **ROLE** | Facilitator | **PROJECT** | Amplify Hillingdon |
| **CONTRACTOR** | Full name | **MOBILE** | 07700 900123 |
| **EMAIL** | name@example.com | **VENUE** | Studio Bus, West Drayton |
| **SESSIONS** | 8 sessions | **DATES** | Every Wednesday from 30/09/2026 *(or list them: 30/09/2026, 07/10/2026, …)* |
| **TIMES** | 11:30 to 14:00, 2.5 hours per session, plus 1 hour of admin per session | **RATE** | £30 per hour |
| **TRAVEL** | £15 per session | **TOTAL FEE** | £… |

"Every Wednesday from…" with "8 sessions" becomes a weekly pattern; "every other Wednesday" or "fortnightly" works too. Word files work as well, but Google Docs are the most reliable.

More than one session on the same day works too:

| TIMES | DATES | Sessions made |
| --- | --- | --- |
| 10:00 to 11:00 and 13:00 to 14:00 | 30/09/2026, 07/10/2026 | Two a day on each date, four in all |
| Every 5 minutes from 19:30, 3 minutes each (with SESSIONS "4 sessions") | Today | 19:30, 19:35, 19:40 and 19:45, each 3 minutes long |

DATES can say *Today* or *Tomorrow*. They're turned into real dates when the sheet reads the contract, so the date doesn't move later. In the **Other dates** column, each date can carry its own times, for example `19/10/2026 19:00-19:03, 19/10/2026 19:05-19:08`.

What it reads:

| From the contract | Goes into |
| --- | --- |
| CONTRACTOR, or "*Name*, referred to as 'the Contractor'" | Facilitator |
| MOBILE, EMAIL | Mobile, Email |
| PROJECT, ROLE (+ CREATIVE PRACTICE), VENUE | Project, Role, Venue |
| RATE "£30 per hour" | Rate |
| SESSIONS "6 sessions" or "six sessions" | Number of sessions |
| TIMES "2 hours per session, plus 1 hour of admin per session" | Delivery and admin hours. One clock time like "11:30 to 14:00" goes into Start and End. Several go into Other dates, with each date. |
| DATES: "Every Wednesday from 30/09/2026" | First session + Repeats (with SESSIONS as the count) |
| DATES: a list (30/09/2026 or 30 September 2026), Today or Tomorrow | Other dates |
| TRAVEL "£15 per session", if the contract has it | Travel |

- **Never overwritten:** it only fills empty cells, so anything already typed in the row is kept.
- **Missing details:** anything the contract doesn't have (for example a mobile, or dates that say "to confirm") is listed in Contract notes for you to add.
- **File types:** Word files and Google Docs work. A PDF (for example a signed copy) can't be read yet, and the note will say so: link the Word version instead.
- **Permissions:** the first time it reads a file, Google asks permission for the sheet to open files in your Drive.

Typing a row in by hand works too. Add the session pattern (for example First session *30/09/2026*, Repeats *Weekly*, Number of sessions *8*, Start *11:30*, End *14:00*). **Make sessions** creates them in date order, numbered, and never duplicates. A contract without dates is skipped, and the note says why.

Rate, hours and travel aren't used by the check-ins yet. They're recorded so pro-formas can be built from the same sheet later.

## How texts are sent

| Setting | Choices |
| --- | --- |
| **Send check-ins by** | **Text** (default, automatic), **WhatsApp** (the coordinator gets a one-tap "Send on WhatsApp" link, because WhatsApp can't send automatically without a Meta business account) or **Email** (automatic). |
| **Texts go through** | **Phone** (default, free) or **Voodoo** (paid SMS service, if you'd rather not rely on a phone). |
| **Phone hours** | When the phone is switched on, for example `Wed 09:00-17:30, Thu 09:00-17:30` or `Mon-Fri 09:00-17:30`. Texts due outside these hours wait until the phone is next on. |

The phone sends the texts, so it has to be on when they're due. With workshops ending by 2pm on Wednesdays, keep it on during working hours on Wednesday (check-ins) and Thursday (9am reminders).

Until the phone is connected, the sheet is in **test mode**: each text goes to the **Message log** tab and nothing reaches a phone.

If a text can't go (no mobile in the sheet, or the phone service refuses it), the coordinator gets an email with a **Send on WhatsApp** link for that session. A failed text isn't retried, so nobody gets duplicates. A text the phone can't pick up within an hour expires, so a check-in never turns up hours late.

## Set it up (about 20 minutes)

This makes its own new sheet. It never touches any other spreadsheet, so use it as the test sheet.

### The sheet

1. Create a new Google Sheet, for example *Check-ins TEST*.
2. **Extensions > Apps Script.** Delete what's in `Code.gs` and paste in [`Code.gs`](Code.gs).
3. Click **+ > HTML**, name it `CheckIn` (no `.html`), and paste in [`CheckIn.html`](CheckIn.html). Save.
4. **Deploy > New deployment.** Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy**, allow the permissions, and copy the link that ends in `/exec`.
5. Back in the sheet, reload the page. A **Check-ins** menu appears. Click **Check-ins > Set up this sheet** and allow the permissions. Google may warn that the app isn't verified, because you made it yourself: click **Advanced**, then **Go to** the project.
6. Paste the `/exec` link into **Settings > Web app URL** and add the coordinator's email. Run **Check-ins > Set up this sheet** once more.

### Test it today, with sessions 5 minutes apart

A test contract makes four 3-minute sessions, 5 minutes apart, so you can watch the whole loop in about half an hour instead of waiting a week. There's one in the testing folder on Drive, or copy the Key Terms table above with TIMES *Every 5 minutes from 19:30, 3 minutes each*, SESSIONS *4 sessions* and DATES *Today*.

1. In the test contract, put your own mobile in **MOBILE** and change **19:30** to about 10 minutes from now.
2. In **Settings**:
   - clear **Phone hours**, so texts can go at any time (the usual hours may not cover today)
   - set **Check-in due** to **1**
3. Paste the contract's link into **Contracts**, then **Check-ins > Read new contracts**. The note should say *Ready*.
4. **Check-ins > Make sessions from new contracts.** Four rows appear on **Sessions**.
5. Wait. The sheet checks every 5 minutes, so each text comes within about 5 minutes of a session ending. **Check-ins > Check for due sessions now** sends anything due straight away.

Before the phone is connected, the texts go to the **Message log** marked *TEST MODE*. Copy link 1 from the Sessions tab into your phone's browser to see the Status cell go green, and try link 2 for the form. Once the phone is connected, the same texts reach your mobile.

Answer every test session, or a reminder text goes at 9am tomorrow. When you've finished, put **Phone hours** and **Check-in due** back to how they were.

### The phone

1. On a spare Android phone with a SIM that includes texts, install **SMS Gateway for Android** (see [sms-gate.app](https://sms-gate.app/)).
2. In the app, switch on **Cloud server** and note the **Username** and **Password** it shows.
3. In the sheet: **Check-ins > Connect the phone** and paste them. They're stored in the script's private settings, not in a cell.
4. **Check-ins > Send a test text** to your own mobile.

Texts come from the phone's own number, so save it in your facilitators' contacts as "YUAF check-ins".

## Good to know

- **Links are private.** Each session gets a random key. The page only shows that one session and never shows a phone number or email.
- **Tapping link 1 twice, or after link 2, is safe.** It never overwrites an answer already given.
- **Mobile numbers** can be typed as `07700 900123`, `+44 7700 900123`, or even with the leading 0 dropped by Sheets.
- **Link previews.** The page records "yes" with JavaScript after it opens, so a phone building a link preview shouldn't mark anything delivered. Check this on the first live test.
- **Daily email limits.** Google allows 100 email recipients a day on a personal Gmail account and 1,500 on Google Workspace. Coordinator emails are batched.
- **If "Anyone" is missing at step 4**, a Google Workspace admin has blocked public web apps. They can allow it, or choose "Anyone with a Google account", in which case facilitators must be signed in to Google.
- **Changing the code later:** Deploy > Manage deployments > edit > Version: New version. The links stay the same.
