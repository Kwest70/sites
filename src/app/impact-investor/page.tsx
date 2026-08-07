"use client";

import ReadMore from "@/components/ReadMore";
import "./page.css";

export default function ImpactInvestorPage() {
  const characterText = `Culture keeps getting treated as charity, so it keeps getting funded like charity. Money in, spent, gone.
You've seen the sector. It runs on grants that vanish and organisations that start every year from zero. There's no asset base, no balance sheet, nothing that compounds. A few reserves maybe, but their fear is if they make money they won't get the same next year.
So capital that wants to do good in culture has nowhere sensible to make a continued impact. It either becomes a donation you write off or you walk away and put it in housing where the model actually works.
Culture and the arts generate enormous value but they were never raised to know how to how to hold any of it.

Twenty five years in the creative industries and I've watched the monetary value constantly leak out of it.
I ran a National Portfolio Organisation (NPO) until the funding was cut along with 159 other organisations and artists. There were pioneers within that group, I pioneered Hiphop Theatre when the sector said the audience wasn't there. I've seen work generate millions in cultural and economic value while the people who made it only gained status and still continued to wait for permission to operate. The ecosystem was never built to fully capture what culture produces.
So we're building it.`;

  return (
    <main className="persona-page">
      {/* HEADLINE */}
      <section className="section-full section-dark headline-section">
        <div className="content-max">
          <h1 className="type-display">Impact Investor</h1>
          <p className="subheading">
            Impact Investors wanted. Your capital can't make a return if you can't make a difference.
          </p>
        </div>
      </section>

      {/* THE CHARACTER */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">The Character</h2>
          <ReadMore isDarkBg={false}>
            {characterText}
          </ReadMore>
        </div>
      </section>

      {/* THE PLAN */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">The Plan</h2>
          <p className="type-body">Future Creatives enables culture hold value.</p>

          <div className="plan-features">
            <div className="feature">
              <h3>Crowd commissioning</h3>
              <p>
                Proves demand before capital commits, so you back work the fans
                and audiences already want.
              </p>
            </div>
            <div className="feature">
              <h3>Fractional ownership</h3>
              <p>
                Means cultural assets become sustainable.
              </p>
            </div>
            <div className="feature">
              <h3>Staking and reward pools</h3>
              <p>
                Mean capital recycles rather than evaporates.
              </p>
            </div>
          </div>

          <h3 className="steps-heading">Three steps.</h3>
          <div className="steps-list">
            <div className="step">
              <span className="step-num">One.</span>
              <p>Take your belief token and enter at the founding layer.</p>
            </div>
            <div className="step">
              <span className="step-num">Two.</span>
              <p>Shape A Hiphop Story. A real project and real roadmap with your capital and your voice in what gets built.</p>
            </div>
            <div className="step">
              <span className="step-num">Three.</span>
              <p>Help build the infrastructure that lets culture behave like every other asset class.</p>
            </div>
          </div>

          <p className="type-body mt-2">
            The belief token itself carries no financial return and no promise of
            future value. It's your entry to the founding layer and the ability
            to shape the future of culture, the arts & entertainment.
          </p>
          <p className="type-body">
            The ecosystem is what you're here to help build.
          </p>
        </div>
      </section>

      {/* WHAT'S AT STAKE */}
      <section className="section-full section-light">
        <div className="content-max">
          <h2 className="section-label">What's at stake</h2>
          <p className="type-body">
            Subsidised culture, the arts and entertainment is a potential trillion
            dollar economy that has no infrastructure.
          </p>
          <p className="type-body">
            Remember the 90% of projects that get left on the table. Do nothing and
            it stays that way. The value keeps flowing to intermediaries and
            platforms while the work that is generated remains vulnerable to
            disappears.
          </p>
          <p className="type-body highlight">
            First movers on the rails take the positions. Everyone after builds on
            what's already set.
          </p>

          <div className="outcomes">
            <div className="outcome">
              <p>Culture finally holds its own value and you helped lay the foundation it sits on.</p>
            </div>
            <div className="outcome">
              <p>The work gets made because the demand was proven first.</p>
            </div>
            <div className="outcome">
              <p>The capital keeps working because the model was built to recycle.</p>
            </div>
            <div className="outcome">
              <p>You made history by backing the shift at the point when it needed it the most.</p>
            </div>
          </div>

          <p className="type-body bold mt-2">
            Take your position at the founding layer.
          </p>
        </div>
      </section>

      {/* HOW */}
      <section className="section-full section-dark">
        <div className="content-max">
          <h2 className="section-label">How?</h2>
          <p className="type-body">Grab that token.</p>
          <p className="type-body smaller">
            There's a gold button at the end of each page. The launch app button should say "Buy Belief"
          </p>
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
