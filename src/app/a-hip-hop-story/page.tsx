import { Section, Label, Heading, Lead, Callout, BuyCTA } from "@/components/blocks";

export default function AHipHopStoryPage() {
  return (
    <main className="fade-in">
      {/* THE PROJECT */}
      <Section tone="dark" className="pt-24 md:pt-32">
        <Label>The Project</Label>
        <Heading className="mb-8">A Hip Hop Story</Heading>
        <Lead>
          The first project built on the Future Creatives model — and the show that pioneered
          Hip Hop Theatre, celebrating its 25th anniversary in 2028.
        </Lead>
      </Section>

      {/* THE STORY */}
      <Section tone="light">
        <Label>The story</Label>
        <Callout>
          Copy coming soon. This project page will carry the story of A Hip Hop Story, the
          roadmap, and how your voice and capital shape what gets built — rendered in ReadMore
          blocks in the same brutalist style as the rest of the site.
        </Callout>
      </Section>

      {/* THE ROADMAP */}
      <Section tone="dark">
        <Label>The roadmap</Label>
        <Callout>Copy coming soon — the build milestones and how backers participate.</Callout>
      </Section>

      {/* CTA */}
      <Section tone="light">
        <Lead>Shape A Hip Hop Story from the founding layer. How? Buy your belief token.</Lead>
        <div className="mt-10">
          <BuyCTA />
        </div>
      </Section>
    </main>
  );
}
