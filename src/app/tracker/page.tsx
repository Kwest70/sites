import type { Metadata } from "next";
import { TrackerApp } from "@/components/tracker/TrackerApp";

export const metadata: Metadata = {
  title: "Contract Fulfilment Tracker · YUAF pilot",
  description:
    "Facilitators confirm each session, changes to the delivery schedule are logged, and pro-formas build themselves from what was delivered.",
  robots: { index: false },
};

export default function TrackerPage() {
  return <TrackerApp />;
}
