import { ReadMore } from "@/components/ReadMore";
import { Section, Label, Heading, Lead, Callout, BuyCTA, BulletList } from "@/components/blocks";

export default function PhilanthropistPage() {
  return (
    <main className="fade-in">
      {/* THE CHARACTER */}
      <Section tone="dark" className="pt-24 md:pt-32">
        <Label>The Philanthropist</Label>
        <Lead className="mb-8">You fund culture because you believe it should exist.</Lead>
        <Heading>But every gift you&apos;ve given has fizzled out. Wouldn&apos;t you like your fund to do more?</Heading>
      </Section>

      {/* THE PROBLEM */}
      <Section tone="light">
        <Label>The problem</Label>
        <ReadMore
          paragraphs={[
            "Every gift you've made has been spent. That's the design. Money goes to a project, the project happens, the money's gone. Maybe there's some reserves, but the organisation/artists fear of not getting the same level of funding so they start the year from zero. Next season the same organisation opens the same conversation from zero and so the scarcity cycle continues. You've had that conversation many times.",
            "The warm feeling arrives on the day you give. Then it fades and you're left wondering what the money built once the activity you funded stopped.",
            "Housing, health, enterprise all worked it out. Capital that recycles is standard practice across the foundation world. However, culture and the subsidised arts didn't receive the brief about how to do that. If it did it ignored it.",
            "I've been a pioneer in the creative industries for over twenty five years and I've been on the receiving end of this money. I ran a National Portfolio Organisation (NPO), pioneered Hiphop Theatre when the sector said the audience wasn't there and built an organisation from sole trader to six figures on subsidy and I know precisely what happens to a gift once it lands. It gets spent well, and then it's gone and the next application starts empty. Saying survival is precarious is an understatement. I always knew that so when our funding was cut with another 159 companies and artists. I knew it was time to try to make an alternative ecosystem that didn't mean going to the institutions for help because they were also in crises and the industry had come to expect things of them, they could never deliver. So I'm building the ecosystem I needed and believe the industry now needs beyond institutional speed.",
          ]}
        />
      </Section>

      {/* THE PLAN */}
      <Section tone="dark">
        <Label>The plan</Label>
        <Heading className="mb-8">Asset-producing philanthropy in culture.</Heading>
        <p className="text-lg">
          The ecosystem supports asset producing philanthropy in culture. The following are
          illustrations of the thinking, rather than products on sale today.
        </p>
        <BulletList
          items={[
            "A building. Fractional ownership of a creative space, so the asset holds and the space keeps operating.",
            "Purchase a mixed use commercial/residential space. Affordable rent for creatives and event ticket sales generating income to support more artists/projects.",
            "A catalogue. An ownership position in work that keeps earning, feeding the next commission.",
            "A pool. Capital staked into the ecosystem, generating a flow that funds projects continuously.",
          ]}
        />
        <p className="mt-8 text-lg">Your capital funds one project, then another, then another.</p>

        <p className="mt-10 label">Three steps</p>
        <BulletList
          items={[
            "One. Take your belief token and enter at the founding layer of the ecosystem.",
            "Two. Shape A Hip Hop Story. A real project and roadmap with your voice in what gets built.",
            "Three. Help lay the rails so recycling capital becomes ordinary in culture.",
          ]}
        />

        <Callout className="mt-10">
          The belief token carries no financial return and no promise of future value.
          You&apos;re funding the infrastructure into existence. That&apos;s the philanthropy.
        </Callout>
      </Section>

      {/* WHAT'S AT STAKE */}
      <Section tone="light">
        <Label>What&apos;s at stake</Label>
        <ReadMore
          paragraphs={[
            "None of your previous giving is working as efficiently as it could. Do nothing and the next gift goes the same way. The sector returns next year needing the same amount and the amount available keeps shrinking. What survives is whatever the masses approve.",
            "Imagine your first gift is still funding work in twenty years. You stop giving to projects and start building the foundation they stand on. Artists you'll never meet get commissioned by capital you set moving decades earlier.",
          ]}
        />
      </Section>

      {/* CTA */}
      <Section tone="dark">
        <Lead>Take your position at the founding layer of the ecosystem. How? Buy your belief token.</Lead>
        <div className="mt-10">
          <BuyCTA />
        </div>
      </Section>
    </main>
  );
}
