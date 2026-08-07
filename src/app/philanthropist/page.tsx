"use client";

import ReadMore from "@/components/ReadMore";
import "./page.css";

export default function PhilanthropistPage() {
  const problemText = `Every gift you've made has been spent.
That's the design. Money goes to a project, the project happens, the money's gone. Maybe there's some reserves, but the organisation/artists fear of not getting the same level of funding so they start the year from zero.
Next season the same organisation opens the same conversation from zero and so the scarcity cycle continues. You've had that conversation many times.
The warm feeling arrives on the day you give. Then it fades and you're left wondering what the money built once the activity you funded stopped.
Housing, health, enterprise all worked it out. Capital that recycles is standard practice across the foundation world. However, culture and the subsidised arts didn't receive the brief about how to do that. If it did it ignored it.
I've been in a pioneer in the creative industries for over twenty five years and I've been on the receiving end of this money.
I ran a National Portfolio Organisation (NPO), pioneered Hiphop Theatre when the sector said the audience wasn't there and built an organisation from sole trader to six figures on subsidy and I know precisely what happens to a gift once it lands. It gets spent well, and then it's gone and the next application starts empty. Saying survival is precarious is an understatement.  I always knew that so when our funding was cut with another 159 companies and artists.
I knew it was time to try to make an alternative ecosystem that didn't mean going to the institutions for help because they were also in crises and the industry had come to expect things of them, they could never deliver.
So I'm building the ecosystem I needed and believe the industry now needs beyond institutional speed.`;

  return (
    <main className="persona-page">
      {/* HEADLINE */}
      <section className="section-full section-dark headline-section">
        <div className="content-max">
          <h1 className="type-display">The Philanthropist</h1>
          <p className="subheading">
            You fund culture because you believe it should exist.
          </p>
        </div>
      </section>

      {/* THE CALL */}
      <section className="section-full section-light call-section">
        <div className="content-max">
          <h2 className="call-out">BUT EVERY GIFT YOU'VE GIVEN HAS FIZZLED OUT.</h2>
          <h2 className="call-out">WOULDN'T YOU LIKE YOUR FUND TO DO MORE?</h2>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">The Problem</h2>
          <ReadMore isDarkBg={true}>
            {problemText}
          </ReadMore>
        </div>
      </section>

      {/* THE PLAN */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">The Plan</h2>
          <p className="type-body">
            The ecosystem supports asset producing philanthropy in culture. The following are illustrations of the thinking, rather than products on sale today.
          </p>

          <div className="plan-items">
            <div className="plan-item">
              <h3>A building</h3>
              <p>
                Fractional ownership of a creative space, so the asset holds and
                the space keeps operating.
              </p>
            </div>
            <div className="plan-item">
              <h3>Purchase a mixed use commercial/residential space</h3>
              <p>
                Affordable rent for creatives and event ticket sales generating
                income to support more artists/projects
              </p>
            </div>
            <div className="plan-item">
              <h3>A catalogue</h3>
              <p>
                An ownership position in work that keeps earning, feeding the
                next commission.
              </p>
            </div>
            <div className="plan-item">
              <h3>A pool</h3>
              <p>
                Capital staked into the ecosystem, generating a flow that funds
                projects continuously.
              </p>
            </div>
          </div>

          <p className="type-body mt-2">
            Your capital funds one project, then another, then another.
          </p>

          <h3 className="plan-steps">Three steps.</h3>
          <div className="steps-list">
            <div className="step">
              <span className="step-num">One.</span>
              <p>Take your belief token and enter at the founding layer of the ecosystem.</p>
            </div>
            <div className="step">
              <span className="step-num">Two.</span>
              <p>Shape A Hip Hop Story. A real project and roadmap with your voice in what gets built.</p>
            </div>
            <div className="step">
              <span className="step-num">Three.</span>
              <p>Help lay the rails so recycling capital becomes ordinary in culture.</p>
            </div>
          </div>

          <p className="type-body mt-2">
            The belief token carries no financial return and no promise of future value. You're funding the infrastructure into existence. That's the philanthropy.
          </p>
        </div>
      </section>

      {/* WHAT'S AT STAKE */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">What's at stake</h2>
          <p className="type-body">
            None of your previous giving is working as efficiently as it could.
          </p>
          <p className="type-body">
            Do nothing and the next gift goes the same way. The sector returns next
            year needing the same amount and the amount available keeps shrinking.
            What survives is whatever the masses approve.
          </p>
          <p className="type-body highlight">
            Imagine your first gift is still funding work in twenty years.
          </p>
          <p className="type-body">
            You stop giving to projects and start building the foundation they stand
            on. Artists you'll never meet get commissioned by capital you set moving
            decades earlier.
          </p>
          <p className="type-body bold">
            Take your position at the founding layer of the ecosystem.
          </p>
        </div>
      </section>

      {/* HOW */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">How?</h2>
          <p className="type-body">Buy your belief token.</p>
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
    </main>
  );
}
