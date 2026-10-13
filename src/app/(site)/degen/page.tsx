import { Section, Label, Heading, Lead, Callout, BuyCTA } from "@/components/blocks";

export default function DegenPage() {
  return (
    <main className="fade-in">
      {/* THE CHARACTER */}
      <Section tone="dark" className="pt-24 md:pt-32">
        <Label>The Degen</Label>
        <Lead className="mb-8">You&apos;re early. You back the culture before the world catches up.</Lead>
        <Heading>You&apos;ve been right before everyone else was ready. Do it again.</Heading>
      </Section>

      {/* THE PROBLEM */}
      <Section tone="light">
        <Label>The problem</Label>
        <Callout>
          Copy coming soon. This persona follows the same StoryBrand structure as the other
          routes — the reader is the hero, Future Creatives is the guide — and ends on a single
          call to action. Drop the Degen problem copy here and it renders inside a ReadMore.
        </Callout>
      </Section>

      {/* THE PLAN */}
      <Section tone="dark">
        <Label>The plan</Label>
        <Callout>Copy coming soon — the plan, the three steps, and the belief-token note.</Callout>
      </Section>

      {/* WHAT'S AT STAKE */}
      <Section tone="light">
        <Label>What&apos;s at stake</Label>
        <Callout>Copy coming soon — what happens if you move, and what happens if you don&apos;t.</Callout>
      </Section>

      {/* CTA */}
      <Section tone="dark">
        <Lead>Take your position at the founding layer. How? Go grab that token.</Lead>
        <div className="mt-10">
          <BuyCTA />
        </div>
      </Section>
    </main>
  );
}
