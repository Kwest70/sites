import { ReadMore } from "@/components/ReadMore";
import { Section, Label, Heading, Lead, Callout, BuyCTA, BulletList } from "@/components/blocks";

export default function ImpactInvestorPage() {
  return (
    <main className="fade-in">
      {/* THE CHARACTER */}
      <Section tone="dark" className="pt-24 md:pt-32">
        <Label>The Impact Investor</Label>
        <Lead className="mb-8">Impact Investors wanted.</Lead>
        <Heading>Your capital can&apos;t make a return if you can&apos;t make a difference.</Heading>
      </Section>

      {/* THE PROBLEM */}
      <Section tone="light">
        <Label>The problem</Label>
        <ReadMore
          paragraphs={[
            "Culture keeps getting treated as charity, so it keeps getting funded like charity. Money in, spent, gone. You've seen the sector. It runs on grants that vanish and organisations that start every year from zero. There's no asset base, no balance sheet, nothing that compounds. A few reserves maybe, but their fear is if they make money they won't get the same next year. So capital that wants to do good in culture has nowhere sensible to make a continued impact. It either becomes a donation you write off or you walk away and put it in housing where the model actually works.",
            "Culture and the arts generate enormous value but they were never raised to know how to hold any of it. Twenty five years in the creative industries and I've watched the monetary value constantly leak out of it. I ran a National Portfolio Organisation (NPO) until the funding was cut along with 159 other organisations and artists. There were pioneers within that group, I pioneered Hiphop Theatre when the sector said the audience wasn't there. I've seen work generate millions in cultural and economic value while the people who made it only gained status and still continued to wait for permission to operate. The ecosystem was never built to fully capture what culture produces. So we're building it.",
          ]}
        />
      </Section>

      {/* THE PLAN */}
      <Section tone="dark">
        <Label>The plan</Label>
        <Heading className="mb-8">Culture that holds value.</Heading>
        <p className="text-lg">Future Creatives enables culture to hold value.</p>
        <BulletList
          items={[
            "Crowd commissioning: proves demand before capital commits, so you back work the fans and audiences already want.",
            "Fractional ownership: means cultural assets become sustainable.",
            "Staking and reward pools: mean capital recycles rather than evaporates.",
          ]}
        />

        <p className="mt-10 label">Three steps</p>
        <BulletList
          items={[
            "One. Take your belief token and enter at the founding layer.",
            "Two. Shape A Hiphop Story. A real project and real roadmap with your capital and your voice in what gets built.",
            "Three. Help build the infrastructure that lets culture behave like every other asset class.",
          ]}
        />

        <Callout className="mt-10">
          The belief token itself carries no financial return and no promise of future value.
          It&apos;s your entry to the founding layer and the ability to shape the future of
          culture, the arts &amp; entertainment. The ecosystem is what you&apos;re here to help build.
        </Callout>
      </Section>

      {/* WHAT'S AT STAKE */}
      <Section tone="light">
        <Label>What&apos;s at stake</Label>
        <ReadMore
          paragraphs={[
            "Subsidised culture, the arts and entertainment is a potential trillion dollar economy that has no infrastructure. Remember the 90% of projects that get left on the table. Do nothing and it stays that way. The value keeps flowing to intermediaries and platforms while the work that is generated remains vulnerable to disappearing.",
            "First movers on the rails take the positions. Everyone after builds on what's already set. Culture finally holds its own value and you helped lay the foundation it sits on. The work gets made because the demand was proven first. The capital keeps working because the model was built to recycle. You made history by backing the shift at the point when it needed it the most.",
          ]}
        />
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
