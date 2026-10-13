import { CyclingHeadline } from "@/components/CyclingHeadline";
import { ReadMore } from "@/components/ReadMore";
import { Section, Label, Heading, Lead, BuyCTA, PersonaCard } from "@/components/blocks";

const essence = [
  "25% of your leisure time gets upgraded.",
  "Someone discovers the thing that moves them.",
  "You share culture with people who may never have found it.",
  "An alternative ecosystem that is democratised, dynamic and sustainable, exists.",
  "They're feelings worth carrying forward.",
];

export default function MasterPage() {
  return (
    <main className="fade-in">
      {/* HERO */}
      <Section tone="dark" className="pt-24 md:pt-32">
        <Label>A decentralised creative economy</Label>
        <CyclingHeadline />
        <p className="mt-8 text-xl leading-relaxed text-offwhite/80">
          Crowd-commission, fractionally own and back the culture, arts and entertainment you
          want to exist. No permission needed. No intermediaries.
        </p>
        <div className="mt-10">
          <BuyCTA label="Get your belief token" />
        </div>
      </Section>

      {/* CLARITY */}
      <Section tone="light">
        <Label>Clarity — What is Future Creatives</Label>
        <Heading className="mb-8">Shape the culture you want to experience.</Heading>
        <ReadMore
          paragraphs={[
            "Future Creatives enables you to shape culture, the arts and entertainment you want to experience. We use decentralised finance, demand driven culture and community ownership to make the creative industries more dynamic, transparent & financially sustainable.",
            "You get access to build and support real projects, from music to film to fashion to stage shows, real say in what gets made and founding status in an ecosystem being built right now. No permission needed. No intermediaries. Just you and culture that matters.",
          ]}
        />
      </Section>

      {/* WHY US */}
      <Section tone="dark">
        <Label>Why us?</Label>
        <Heading className="mb-8">Future Creatives isn&apos;t theory.</Heading>
        <ReadMore
          paragraphs={[
            "Our co-founder and CEO Kwesi Johnson has spent over twenty five years building in the subsidised creative industries, from taking his solo trader creative business to 6 figure income organisation, pioneering AR art and culture trails, developing creative real estate and the progenitor of the international genre, Hiphop Theatre.",
            "We're democratising how we develop and distribute culture, the Arts and entertainment with our show, A Hiphop Story, celebrating its 25th anniversary in 2028 since it premiered. The live show and the roadmap will be built using the exact model we're inviting you into.",
            "We've borrowed from DeFi, community governance and industries way ahead of the subsidised creative sector as far as financial sustainability goes. We're proving this with what we're building together, with you, right now.",
          ]}
        />
      </Section>

      {/* WHAT WE'RE SOLVING */}
      <Section tone="light">
        <Label>What we&apos;re solving</Label>
        <Heading className="mb-8">The system is collapsing faster than ever.</Heading>
        <ReadMore
          paragraphs={[
            "The system that develops, funds and distributes subsidised culture, the arts and entertainment is collapsing faster than it ever has before. Culture will never stop mattering. On average people spend 5 hours a day consuming culture, the arts and entertainment during leisure time. It's how we learn, connect, express, resist and imagine together.",
            "Around 90% of projects in the subsidised creative sector get left on the scrap heap, rejected by a panel deciding what's worthy based on their remit and criteria. We get it, organisations have the right to have their own objectives however, this leaves 1000's of projects to fall through the gaps. That rejection pile is where the potential gold is buried.",
            "The next Hamilton, Sinners or Billy Eilish, who all received resistance from the establishment, could be discarded in that pile right now, killed before they breath, because a panel said no. Diverse work doesn't get made, artists can't afford to take risks and fans and audiences experience a curated shortlist made possible with their taxes, philanthropy and investment but without their input of what/who wins or loses.",
            "Again we get it, we can't expect Institutions to solve everything especially the things they aren't set up to do. Funds and resources are scarce, this model worked because someone has to make the decision of who wins and loses and they make the decisions for the institution they represent, this means the audiences and artists don't always feel they get it right. The 90% that never gets seen and could matter to people never reaches them so they can back it.",
          ]}
        />
      </Section>

      {/* OUR SOLUTION */}
      <Section tone="dark">
        <Label>Our solution</Label>
        <Heading className="mb-8">Demand comes first.</Heading>
        <ReadMore
          paragraphs={[
            "We are releasing more of the locked 90% because Future Creatives flips the top down approach by decentralising the approach to increase the freedom of ideas and their funding and distribution. The crowd commissions what gets made, so demand comes first, meaning the work is already wanted before a penny is spent.",
            "Glocal (global and local) communities, with the creators, fractionally own what they help to bring to life, an album, a stage show, a venue or a movie. Real ownership, real stake, real say in what culture they want.",
          ]}
        />
      </Section>

      {/* THE WHY */}
      <Section tone="light">
        <Label>The why</Label>
        <Heading className="mb-8">Culture&apos;s being compromised.</Heading>
        <ReadMore
          paragraphs={[
            "At the core we believe in helping people make and experience work that brings people together to realise our division is someone else's gain. Because 20-25% of our waking hours are taken up by leisure, which includes the arts, culture and entertainment, we want more to be made that is demand driven and built & validated by the backers, fans and audiences it is intended for.",
            "Culture's being compromised. The niche work that takes risks, that lives on the edge before institutions find it, that refuses to be safe, is disappearing because it's starved of funding. We believe people don't notice it dissapearing because they think they love brands, platforms or an artist, when what they love is culture itself. Commercialisation and risk averse programming hands more or less the same thing to fans on repeat.",
            "We have been here long enough to know the current model means that many venues continue to struggle to survive on 1/3 philanthropy, 1/3 ticket sales and 1/3 funding. They will close. Artists barely survive whilst waiting for permission to create and fans wait to have excellence chosen for them for their shortlist.",
            "We believe audiences, fans, backers and artists should practically back each other directly, so we are giving you the tools to do that. It's not that they didn't support before, but an ecosystem that is based on abundance has never existed to enable them to fully create, explore and support together. That's how culture stays alive, diverse and worth having.",
          ]}
        />
      </Section>

      {/* YOUR OPPORTUNITY */}
      <Section tone="dark">
        <Label>Your opportunity</Label>
        <Heading className="mb-8">Get in early. Define excellence.</Heading>
        <ReadMore
          paragraphs={[
            "Get in early to shape how culture, arts and entertainment get created, funded and owned. Define your version of excellence.",
            "You experience the ecosystem forming around you, fractionally own what you help bring to life, albums, stage shows, venues and creative spaces and you commission projects you believe in, back artists directly and own alongside the culture you want to exist.",
          ]}
        />
      </Section>

      {/* ESSENCE */}
      <Section tone="light">
        <Label>Essence</Label>
        <Heading className="mb-8">You become the reason.</Heading>
        <ul className="grid gap-px border-2 border-midnight bg-midnight sm:grid-cols-2">
          {essence.map((e, i) => (
            <li key={i} className="bg-offwhite p-6 text-lg">
              {e}
            </li>
          ))}
        </ul>
      </Section>

      {/* FIND YOUR ROUTE IN */}
      <Section tone="dark" wide>
        <Label>Find your route in</Label>
        <Heading className="mb-10">Which one are you?</Heading>
        <div className="grid gap-6 md:grid-cols-3">
          <PersonaCard
            name="Philanthropist"
            line="You fund culture because you believe it should exist."
            href="/philanthropist"
          />
          <PersonaCard
            name="Impact Investor"
            line="Your capital can't make a return if you can't make a difference."
            href="/impact-investor"
          />
          <PersonaCard
            name="Degen"
            line="You're early. You back the culture before the world catches up."
            href="/degen"
          />
        </div>
      </Section>

      {/* NEXT STEPS / CTA */}
      <Section tone="light">
        <Label>Next steps</Label>
        <Lead>Get your belief token now. Shape the future of culture from day one.</Lead>
        <div className="mt-10">
          <BuyCTA />
        </div>
      </Section>
    </main>
  );
}
