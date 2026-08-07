"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReadMore from "@/components/ReadMore";
import "./page.css";

export default function MasterPage() {
  const [cycleWord, setCycleWord] = useState("culture");
  const words = ["culture", "arts", "entertainment"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleWord((prev) => {
        const currentIndex = words.indexOf(prev);
        return words[(currentIndex + 1) % words.length];
      });
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="master-page">
      {/* HERO HEADLINE */}
      <section className="section-full section-dark headline-section">
        <div className="content-max">
          <h1 className="type-display headline">
            You now have the power to shape{" "}
            <span className="cycling-word">{cycleWord}</span>
          </h1>
        </div>
      </section>

      {/* CLARITY: What is Future Creatives */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">What is Future Creatives</h2>
          <ReadMore isDarkBg={false}>
            Future Creatives enables you to shape culture, the arts and
            entertainment you want to experience. We use decentralised finance,
            demand driven culture and community ownership to make the creative
            industries more dynamic, transparent & financially sustainable. You
            get access to build and support real projects, from music to film to
            fashion to stage shows, real say in what gets made and founding
            status in an ecosystem being built right now. No permission needed.
            No intermediaries. Just you and culture that matters.
          </ReadMore>
        </div>
      </section>

      {/* Why Us */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">Why Us?</h2>
          <ReadMore isDarkBg={true}>
            Future Creatives isn't theory. Our co-founder and CEO Kwesi Johnson
            has spent over twenty five years building in the subsidised creative
            industries, from taking his solo trader creative business to 6
            figure income organisation, pioneering AR art and culture trails,
            developing creative real estate and the progenitor of the
            international genre, Hiphop Theatre. We're democratising how we
            develop and distribute culture, the Arts and entertainment with our
            show, A Hiphop Story, celebrating its 25th anniversary in 2028 since
            it premiered. The live show and the roadmap will be built using the
            exact model we're inviting you into. We've borrowed from DeFi,
            community governance and industries way ahead of the subsidised
            creative sector as far as financial sustainability goes. We're
            proving this with what we're building together, with you, right
            now.
          </ReadMore>
        </div>
      </section>

      {/* What We're Solving */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">What We're Solving</h2>
          <ReadMore isDarkBg={false}>
            The system that develops, funds and distributes subsidised culture,
            the arts and entertainment is collapsing faster than it ever has
            before. Culture will never stop mattering. On average people spend 5
            hours a day consuming culture, the arts and entertainment during
            leisure time. It's how we learn, connect, express, resist and
            imagine together. Around 90% of projects in the subsidised creative
            sector get left on the scrap heap, rejected by a panel deciding
            what's worthy based on their remit and criteria. We get it,
            organisations have the right to have their own objectives however,
            this leaves 1000's of projects to fall through the gaps. That
            rejection pile is where the potential gold is buried. The next
            Hamilton, Sinners or Billy Eilish, who all received resistance from
            the establishment, could be discarded in that pile right now, killed
            before they breath, because a panel said no. Diverse work doesn't
            get made, artists can't afford to take risks and fans and audiences
            experience a curated shortlist made possible with their taxes,
            philanthropy and investment but without their input of what/who wins
            or loses. Again we get it, we can't expect Institutions to solve
            everything especially the things they aren't set up to do. Funds and
            resources are scarce, this model worked because someone has to make
            the decision of who wins and loses and they make the decisions for
            the institution they represent, this means the audiences and artists
            don't always feel they get it right. The 90% that never gets seen
            and could matter to people never reaches them so they can back it.
          </ReadMore>
        </div>
      </section>

      {/* Our Solution */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">Our Solution</h2>
          <ReadMore isDarkBg={true}>
            We are releasing more of the locked 90% because Future Creatives
            flips the top down approach by decentralising the approach to
            increase the freedom of ideas and their funding and distribution.
            The crowd commissions what gets made, so demand comes first, meaning
            the work is already wanted before a penny is spent. Glocal (global
            and local) communities, with the creators, fractionally own what
            they help to bring to life, an album, a stage show, a venue or a
            movie. Real ownership, real stake, real say in what culture they
            want.
          </ReadMore>
        </div>
      </section>

      {/* The Why */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">The Why</h2>
          <ReadMore isDarkBg={false}>
            At the core we believe in helping people make and experience work
            that brings people together to realise our division is someone
            else's gain. Because 20-25% of our waking hours are taken up by
            leisure, which includes the arts, culture and entertainment, we want
            more to be made that is demand driven and built & validated by the
            backers, fans and audiences it is intended for. Culture's being
            compromised. The niche work that takes risks, that lives on the edge
            before institutions find it, that refuses to be safe, is
            disappearing because it's starved of funding. We believe people
            don't notice it dissapearing because they think they love brands,
            platforms or an artist, when what they love is culture itself.
            Commercialisation and risk averse programming hands more or less the
            same thing to fans on repeat. We have been here long enough to know
            the current model means that many venues continue to struggle to
            survive on 1/3 philanthropy, 1/3 ticket sales and 1/3 funding. They
            will close. Artists barely survive whilst waiting for permission to
            create and fans wait to have excellence chosen for them for their
            shortlist. We believe audiences, fans, backers and artists should
            practically back each other directly, so we are giving you the tools
            to do that. It's not that they didn't support before, but an
            ecosystem that is based on abundance has never existed to enable
            them to fully create, explore and support together.
          </ReadMore>
        </div>
      </section>

      {/* The Why Essence */}
      <section className="section-full section-dark">
        <div className="content-max">
          <p className="essence-text">That's how culture stays alive, diverse and worth having.</p>
        </div>
      </section>

      {/* Your Opportunity */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">Your Opportunity</h2>
          <ReadMore isDarkBg={false}>
            Get in early to shape how culture, arts and entertainment get
            created, funded and owned. Define your version of excellence. You
            experience the ecosystem forming around you, fractionally own what
            you help bring to life, albums, stage shows, venues and creative
            spaces and you commission projects you believe in, back artists
            directly and own alongside the culture you want to exist.
          </ReadMore>
        </div>
      </section>

      {/* Next Steps */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">Next Steps</h2>
          <p className="type-body">Get your belief token now. Shape the future of culture from day one.</p>
        </div>
      </section>

      {/* Essence */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">Essence</h2>
          <div className="essence-grid">
            <div className="essence-item">
              <p>You become the reason</p>
            </div>
            <div className="essence-item">
              <p>25% of your leisure time gets upgraded</p>
            </div>
            <div className="essence-item">
              <p>Someone discovers the thing that moves them</p>
            </div>
            <div className="essence-item">
              <p>You share culture with people who may never have found it.</p>
            </div>
            <div className="essence-item">
              <p>
                An alternative ecosystem that is democratised, dynamic and
                sustainable, exists
              </p>
            </div>
            <div className="essence-item">
              <p>They're are feelings worth carrying forward.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Route In */}
      <section className="section-full section-dark find-route-section">
        <div className="content-max">
          <h2 className="section-label">Find your route in</h2>
          <div className="personas-grid">
            <Link href="/philanthropist" className="persona-card">
              <h3 className="persona-name">Philanthropist</h3>
              <p className="persona-description">
                Fund culture that stays at work for decades
              </p>
            </Link>
            <Link href="/impact-investor" className="persona-card">
              <h3 className="persona-name">Impact Investor</h3>
              <p className="persona-description">
                Capital that compounds and makes a difference
              </p>
            </Link>
            <Link href="/degen" className="persona-card">
              <h3 className="persona-name">Degen</h3>
              <p className="persona-description">
                Own a piece of the culture you believe in
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-full section-light cta-section">
        <div className="content-max">
          <a href="#get-belief-token" className="btn-cta">
            Get Belief Token
          </a>
        </div>
      </section>

      {/* Project Story */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">
            <Link href="/a-hip-hop-story" className="project-link">
              A Hip Hop Story →
            </Link>
          </h2>
          <p className="type-body">25 years, 2028 and you.</p>
        </div>
      </section>
    </main>
  );
}
