"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BuySection from "@/components/BuySection";
import ReadMore from "@/components/ReadMore";

const CYCLE = ["culture", "arts", "entertainment"];

const ROUTES = [
  {
    href: "/philanthropist",
    name: "Philanthropist",
    line: "You fund culture because you believe it should exist. Make the gift keep working.",
  },
  {
    href: "/impact-investor",
    name: "Impact Investor",
    line: "Your capital can't make a return if it can't make a difference.",
  },
  {
    href: "/degen",
    name: "Degen",
    line: "Get in at the founding layer, before the rails are set.",
  },
];

export default function MasterPage() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % CYCLE.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <main>
      {/* ---- Hero ---------------------------------------------------- */}
      <section className="section section--dark hero">
        <div className="wrap">
          <h1 className="display">
            You now have the power to shape{" "}
            <span className="hero__cycle">{CYCLE[i]}</span>
          </h1>
        </div>
      </section>

      {/* ---- Clarity ------------------------------------------------- */}
      <section className="section section--light">
        <div className="wrap">
          <span className="label">Clarity</span>
          <h2 className="lead">What is Future Creatives</h2>
          <ReadMore>
            <p>
              Future Creatives enables you to shape culture, the arts and
              entertainment you want to experience. We use decentralised
              finance, demand driven culture and community ownership to make the
              creative industries more dynamic, transparent &amp; financially
              sustainable.
            </p>
            <p>
              You get access to build and support real projects, from music to
              film to fashion to stage shows, real say in what gets made and
              founding status in an ecosystem being built right now. No
              permission needed. No intermediaries. Just you and culture that
              matters.
            </p>
          </ReadMore>
        </div>
      </section>

      {/* ---- Authority ----------------------------------------------- */}
      <section className="section section--dark">
        <div className="wrap">
          <span className="label">Authority</span>
          <h2 className="lead">Why us?</h2>
          <ReadMore>
            <p>
              Future Creatives isn&rsquo;t theory. Our co-founder and CEO Kwesi
              Johnson has spent over twenty five years building in the subsidised
              creative industries, from taking his solo trader creative business
              to 6 figure income organisation, pioneering AR art and culture
              trails, developing creative real estate and the progenitor of the
              international genre, Hiphop Theatre.
            </p>
            <p>
              We&rsquo;re democratising how we develop and distribute culture,
              the Arts and entertainment with our show, A Hiphop Story,
              celebrating its 25th anniversary in 2028 since it premiered. The
              live show and the roadmap will be built using the exact model
              we&rsquo;re inviting you into.
            </p>
            <p>
              We&rsquo;ve borrowed from DeFi, community governance and industries
              way ahead of the subsidised creative sector as far as financial
              sustainability goes. We&rsquo;re proving this with what we&rsquo;re
              building together, with you, right now.
            </p>
          </ReadMore>
        </div>
      </section>

      {/* ---- Problem ------------------------------------------------- */}
      <section className="section section--light">
        <div className="wrap">
          <span className="label">The Problem</span>
          <h2 className="lead">What we&rsquo;re solving</h2>
          <ReadMore>
            <p>
              The system that develops, funds and distributes subsidised
              culture, the arts and entertainment is collapsing faster than it
              ever has before.
            </p>
            <p>
              Culture will never stop mattering. On average people spend 5 hours
              a day consuming culture, the arts and entertainment during leisure
              time. It&rsquo;s how we learn, connect, express, resist and imagine
              together.
            </p>
            <p>
              Around 90% of projects in the subsidised creative sector get left
              on the scrap heap, rejected by a panel deciding what&rsquo;s worthy
              based on their remit and criteria. We get it, organisations have
              the right to have their own objectives however, this leaves
              1000&rsquo;s of projects to fall through the gaps. That rejection
              pile is where the potential gold is buried.
            </p>
            <p>
              The next Hamilton, Sinners or Billie Eilish, who all received
              resistance from the establishment, could be discarded in that pile
              right now, killed before they breathe, because a panel said no.
            </p>
            <p>
              Diverse work doesn&rsquo;t get made, artists can&rsquo;t afford to
              take risks and fans and audiences experience a curated shortlist
              made possible with their taxes, philanthropy and investment but
              without their input of what and who wins or loses.
            </p>
            <p>
              Again we get it, we can&rsquo;t expect institutions to solve
              everything, especially the things they aren&rsquo;t set up to do.
              Funds and resources are scarce. This model worked because someone
              has to make the decision of who wins and loses, and they make the
              decisions for the institution they represent. This means the
              audiences and artists don&rsquo;t always feel they get it right.
            </p>
            <p>
              The 90% that never gets seen and could matter to people never
              reaches them so they can back it.
            </p>
          </ReadMore>
        </div>
      </section>

      {/* ---- Solution ------------------------------------------------ */}
      <section className="section section--dark">
        <div className="wrap">
          <span className="label">Our Solution</span>
          <h2 className="lead">We are releasing more of the locked 90%</h2>
          <ReadMore>
            <p>
              Future Creatives flips the top down approach by decentralising the
              approach to increase the freedom of ideas and their funding and
              distribution.
            </p>
            <p>
              The crowd commissions what gets made, so demand comes first,
              meaning the work is already wanted before a penny is spent. Glocal
              (global and local) communities, with the creators, fractionally own
              what they help to bring to life, an album, a stage show, a venue or
              a movie. Real ownership, real stake, real say in what culture they
              want.
            </p>
          </ReadMore>
        </div>
      </section>

      {/* ---- The Why ------------------------------------------------- */}
      <section className="section section--light">
        <div className="wrap">
          <span className="label">The Why</span>
          <h2 className="lead">
            Culture&rsquo;s being compromised
          </h2>
          <ReadMore>
            <p>
              At the core we believe in helping people make and experience work
              that brings people together to realise our division is someone
              else&rsquo;s gain.
            </p>
            <p>
              Because 20&ndash;25% of our waking hours are taken up by leisure,
              which includes the arts, culture and entertainment, we want more to
              be made that is demand driven and built &amp; validated by the
              backers, fans and audiences it is intended for.
            </p>
            <p>
              The niche work that takes risks, that lives on the edge before
              institutions find it, that refuses to be safe, is disappearing
              because it&rsquo;s starved of funding. We believe people don&rsquo;t
              notice it disappearing because they think they love brands,
              platforms or an artist, when what they love is culture itself.
              Commercialisation and risk averse programming hands more or less
              the same thing to fans on repeat.
            </p>
            <p>
              We have been here long enough to know the current model means that
              many venues continue to struggle to survive on 1/3 philanthropy,
              1/3 ticket sales and 1/3 funding. They will close. Artists barely
              survive whilst waiting for permission to create, and fans wait to
              have excellence chosen for them for their shortlist.
            </p>
            <p>
              We believe audiences, fans, backers and artists should practically
              back each other directly, so we are giving you the tools to do
              that. It&rsquo;s not that they didn&rsquo;t support before, but an
              ecosystem that is based on abundance has never existed to enable
              them to fully create, explore and support together.
            </p>
          </ReadMore>

          <div className="callout">
            <p>That&rsquo;s how culture stays alive, diverse and worth having.</p>
          </div>
        </div>
      </section>

      {/* ---- Opportunity --------------------------------------------- */}
      <section className="section section--dark">
        <div className="wrap">
          <span className="label">Your Opportunity</span>
          <h2 className="lead">
            Get in early to shape how culture, arts and entertainment get
            created, funded and owned
          </h2>
          <ReadMore>
            <p>Define your version of excellence.</p>
            <p>
              You experience the ecosystem forming around you, fractionally own
              what you help bring to life &mdash; albums, stage shows, venues and
              creative spaces &mdash; and you commission projects you believe in,
              back artists directly and own alongside the culture you want to
              exist.
            </p>
          </ReadMore>
        </div>
      </section>

      {/* ---- Find your route in -------------------------------------- */}
      <section className="section section--light">
        <div className="wrap">
          <span className="label">Find your route in</span>
          <h2 className="lead">Three ways to take a position</h2>

          <div className="routes">
            {ROUTES.map(({ href, name, line }) => (
              <Link key={href} href={href} className="route-card">
                <h3 className="route-card__name">{name}</h3>
                <p className="route-card__line">{line}</p>
                <span className="route-card__go">Enter &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Next steps ---------------------------------------------- */}
      <section className="section section--dark">
        <div className="wrap">
          <span className="label">Next Steps</span>
          <p className="lead">
            Get your belief token now. Shape the future of culture from day one.
          </p>
        </div>
      </section>

      {/* ---- Essence -------------------------------------------------- */}
      <section className="section section--light">
        <div className="wrap">
          <span className="label">Essence</span>
          <p className="lead">You become the reason:</p>

          <ul className="stack">
            <li>25% of your leisure time gets upgraded</li>
            <li>Someone discovers the thing that moves them</li>
            <li>You share culture with people who may never have found it</li>
            <li>
              An alternative ecosystem that is democratised, dynamic and
              sustainable, exists
            </li>
          </ul>

          <div className="callout">
            <p>They are feelings worth carrying forward.</p>
          </div>
        </div>
      </section>

      <BuySection note="Placeholder — links to the NFT purchase flow" />
    </main>
  );
}
