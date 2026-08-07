import BuySection from "@/components/BuySection";
import ReadMore from "@/components/ReadMore";

export const metadata = {
  title: "Impact Investor — Future Creatives",
  description:
    "Culture is a potential trillion dollar economy with no infrastructure. Help lay the rails.",
};

export default function ImpactInvestorPage() {
  return (
    <main>
      {/* ---- The character ------------------------------------------- */}
      <section className="section section--dark hero">
        <div className="wrap">
          <span className="label">The Impact Investor</span>
          <h1 className="display display--sm">
            Your capital can&rsquo;t make a return if you can&rsquo;t make a
            difference
          </h1>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <p className="shout">
            Culture keeps getting treated as charity, so it keeps getting funded
            like charity. Money in, spent, gone.
          </p>

          <ReadMore>
            <p>
              You&rsquo;ve seen the sector. It runs on grants that vanish and
              organisations that start every year from zero. There&rsquo;s no
              asset base, no balance sheet, nothing that compounds. A few
              reserves maybe, but their fear is that if they make money they
              won&rsquo;t get the same next year.
            </p>
            <p>
              So capital that wants to do good in culture has nowhere sensible to
              make a continued impact. It either becomes a donation you write
              off, or you walk away and put it in housing where the model
              actually works.
            </p>
            <p>
              Culture and the arts generate enormous value but they were never
              raised to know how to hold any of it.
            </p>
            <p>
              Twenty five years in the creative industries and I&rsquo;ve watched
              the monetary value constantly leak out of it.
            </p>
            <p>
              I ran a National Portfolio Organisation (NPO) until the funding was
              cut along with 159 other organisations and artists. There were
              pioneers within that group. I pioneered Hiphop Theatre when the
              sector said the audience wasn&rsquo;t there. I&rsquo;ve seen work
              generate millions in cultural and economic value while the people
              who made it only gained status, and still continued to wait for
              permission to operate. The ecosystem was never built to fully
              capture what culture produces.
            </p>
            <p>So we&rsquo;re building it.</p>
          </ReadMore>
        </div>
      </section>

      {/* ---- The plan ------------------------------------------------- */}
      <section className="section section--dark">
        <div className="wrap">
          <span className="label">The Plan</span>
          <h2 className="lead">Future Creatives enables culture to hold value</h2>

          <ul className="stack">
            <li>
              <span className="stack__term">Crowd commissioning</span>
              Proves demand before capital commits, so you back work the fans and
              audiences already want.
            </li>
            <li>
              <span className="stack__term">Fractional ownership</span>
              Means cultural assets become sustainable.
            </li>
            <li>
              <span className="stack__term">Staking and reward pools</span>
              Mean capital recycles rather than evaporates.
            </li>
          </ul>

          <ul className="stack">
            <li>
              <span className="stack__term">One</span>
              Take your belief token and enter at the founding layer.
            </li>
            <li>
              <span className="stack__term">Two</span>
              Shape A Hiphop Story. A real project and real roadmap with your
              capital and your voice in what gets built.
            </li>
            <li>
              <span className="stack__term">Three</span>
              Help build the infrastructure that lets culture behave like every
              other asset class.
            </li>
          </ul>

          <div className="callout">
            <p>
              The belief token itself carries no financial return and no promise
              of future value. It&rsquo;s your entry to the founding layer and
              the ability to shape the future of culture, the arts &amp;
              entertainment.
            </p>
            <p>The ecosystem is what you&rsquo;re here to help build.</p>
          </div>
        </div>
      </section>

      {/* ---- What's at stake ------------------------------------------ */}
      <section className="section section--light">
        <div className="wrap">
          <span className="label">What&rsquo;s at stake</span>
          <h2 className="lead">
            A potential trillion dollar economy that has no infrastructure
          </h2>

          <ReadMore>
            <p>
              Remember the 90% of projects that get left on the table. Do nothing
              and it stays that way. The value keeps flowing to intermediaries
              and platforms while the work that is generated remains vulnerable
              to disappearing.
            </p>
            <p>
              First movers on the rails take the positions. Everyone after builds
              on what&rsquo;s already set.
            </p>
            <p>
              Culture finally holds its own value and you helped lay the
              foundation it sits on. The work gets made because the demand was
              proven first. The capital keeps working because the model was built
              to recycle.
            </p>
            <p>
              You made history by backing the shift at the point when it needed
              it the most.
            </p>
          </ReadMore>

          <p className="shout">Take your position at the founding layer.</p>
        </div>
      </section>

      {/* ---- How ------------------------------------------------------ */}
      <section className="section section--dark">
        <div className="wrap">
          <span className="label">How?</span>
          <p className="lead">Go grab that token.</p>
        </div>
      </section>

      <BuySection note="Placeholder — links to the NFT purchase flow" />
    </main>
  );
}
