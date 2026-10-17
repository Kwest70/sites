This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contract Fulfilment Tracker (`/tracker`)

An MVP for YUAF's facilitator contracts. Facilitators turn each session's cell green once it has gone ahead; changes to the delivery schedule are logged with their effect on pay; pro-formas build themselves from what was delivered.

Everything runs in the browser on demo data (saved to `localStorage`, reset from the demo bar). Names, dates and events are made up. Contract terms are modelled on the 121 Mentor Agreement and the Amplify Hillingdon pro-forma.

| Rule | Where |
| --- | --- |
| Invoicing period: 29th to 28th, paid on the 28th, queries by the 26th | `src/lib/tracker/rules.ts` (`periodOf`, `periodInfo`) |
| Reminders: 1 hour after the session, 9am next day, then escalate to the coordinator once the 24-hour monitoring window closes | `reminderTimes`, `dueAlerts` |
| Cancellations: under 48 hours' notice paid in full, otherwise rescheduled before it is invoiced | `sessionState` |
| Pro-forma ledger: owed minus already invoiced, per line, so roll-forwards, deductions and late approvals carry over on their own | `ledger` |
| Budget by cost code and period | `budget` |

The demo history in `src/lib/tracker/seed.ts` is replayed through the same reducer the UI uses (`src/lib/tracker/actions.ts`), so the seeded change log and pro-formas follow the real rules.

To make it real: a database instead of `localStorage`, sign-in per facilitator, a scheduled job that sends the reminders by email or SMS, and real cost codes.

## Session check-ins in Google Sheets (`google-apps-script/session-check-in`)

The facilitator side, without Meta or a new app: a Google Apps Script that lives inside a Google Sheet. After each session the facilitator gets a WhatsApp message with two links. Link 1 ("Did it happen?") marks the session delivered and turns its Status cell green. Link 2 ("Did anything change?") opens a short form. The sheet writes each message; the coordinator sends it with one tap. Setup steps are in [its README](google-apps-script/session-check-in/README.md).
