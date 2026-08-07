import BuySection from "@/components/BuySection";
import ReadMore from "@/components/ReadMore";

export const metadata = {
  title: "Philanthropist — Future Creatives",
  description:
    "Stop giving to projects and start building the foundation they stand on.",
};

export default function PhilanthropistPage() {
  return (
    <main>
      {/* ---- The character ------------------------------------------- */}
      <section className="section section--dark hero">
        <div className="wrap">
          <span className="label">The character</span>
          <h1 className="display display--sm">
            You fund culture because you believe it should exist.
          </h1>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <p className="shout">
            But every gift you&rsquo;ve given has fizzled out.
          </p>
          <p className="shout">Wouldn&rsquo;t you like your fund to do more?</p>
        </div>
      </section>

      {/* ---- The problem --------------------------------------------- */}
      <section className="section section--dark">
        <div className="wrap">
          <h2 className="lead">The problem</h2>
          <ReadMore>
            <p>Every gift you&rsquo;ve made has been spent.</p>
            <p>
              That&rsquo;s the design. Money goes to a project, the project
              happens, the money&rsquo;s gone. Maybe there&rsquo;s some reserves,
              but the organisation/artists fear of not getting the same level of
              funding so they start the year from zero.
            </p>
            <p>
              Next season the same organisation opens the same conversation from
              zero and so the scarcity cycle continues. You&rsquo;ve had that
              conversation many times.
            </p>
            <p>
              The warm feeling arrives on the day you give. Then it fades and
              you&rsquo;re left wondering what the money built once the activity
              you funded stopped.
            </p>
            <p>
              Housing, health, enterprise all worked it out. Capital that
              recycles is standard practice across the foundation world. However,
              culture and the subsidised arts didn&rsquo;t receive the brief
              about how to do that. If it did it ignored it.
            </p>
            <p>
              I&rsquo;ve been a pioneer in the creative industries for over
              twenty five years and I&rsquo;ve been on the receiving end of this
              money.
            </p>
            <p>
              I ran a National Portfolio Organisation (NPO), pioneered Hiphop
              Theatre when the sector said the audience wasn&rsquo;t there and
              built an organisation from sole trader to six figures on subsidy
              and I know precisely what happens to a gift once it lands. It gets
              spent well, and then it&rsquo;s gone and the next application
              starts empty. Saying survival is precarious is an understatement. I
              always knew that so when our funding was cut with another 159
              companies and artists.
            </p>
            <p>
              I knew it was time to try to make an alternative ecosystem that
              didn&rsquo;t mean going to the institutions for help because they
              were also in crises and the industry had come to expect things of
              them, they could never deliver.
            </p>
            <p>
              So I&rsquo;m building the ecosystem I needed and believe the
              industry now needs beyond institutional speed.
            </p>
          </ReadMore>
        </div>
      </section>

      {/* ---- The plan ------------------------------------------------- */}
      <section className="section section--light">
        <div className="wrap">
          <h2 className="lead">The plan</h2>

          <ReadMore>
            <p>
              The ecosystem supports asset producing philanthropy in culture. The
              following are illustrations of the thinking, rather than products
              on sale today.
            </p>
          </ReadMore>

          <ul className="stack">
            <li>
              <span className="stack__term">A building</span>
              Fractional ownership of a creative space, so the asset holds and
              the space keeps operating.
            </li>
            <li>
              <span className="stack__term">
                Purchase a mixed use commercial/residential space
              </span>
              Affordable rent for creatives and event ticket sales generating
              income to support more artists/projects
            </li>
            <li>
              <span className="stack__term">A catalogue</span>
              An ownership position in work that keeps earning, feeding the next
              commission.
            </li>
            <li>
              <span className="stack__term">A pool</span>
              Capital staked into the ecosystem, generating a flow that funds
              projects continuously.
            </li>
          </ul>

          <p className="shout">
            Your capital funds one project, then another, then another.
          </p>

          <p className="stack-heading">Three steps.</p>
          <ul className="stack">
            <li>
              <span className="stack__term">One</span>
              Take your belief token and enter at the founding layer of the
              ecosystem.
            </li>
            <li>
              <span className="stack__term">Two</span>
              Shape A Hip Hop Story. A real project and roadmap with your voice
              in what gets built.
            </li>
            <li>
              <span className="stack__term">Three</span>
              Help lay the rails so recycling capital becomes ordinary in
              culture.
            </li>
          </ul>

          <div className="callout">
            <p>
              The belief token carries no financial return and no promise of
              future value. You&rsquo;re funding the infrastructure into
              existence. That&rsquo;s the philanthropy.
            </p>
          </div>
        </div>
      </section>

      {/* ---- What's at stake ------------------------------------------ */}
      <section className="section section--dark">
        <div className="wrap">
          <h2 className="lead">What&rsquo;s at stake</h2>
          <ReadMore>
            <p>
              None of your previous giving is working as efficiently as it could.
            </p>
            <p>
              Do nothing and the next gift goes the same way. The sector returns
              next year needing the same amount and the amount available keeps
              shrinking. What survives is whatever the masses approve.
            </p>
            <p>Imagine your first gift is still funding work in twenty years.</p>
            <p>
              You stop giving to projects and start building the foundation they
              stand on. Artists you&rsquo;ll never meet get commissioned by
              capital you set moving decades earlier.
            </p>
          </ReadMore>

          <p className="shout">
            Take your position at the founding layer of the ecosystem.
          </p>
        </div>
      </section>

      {/* ---- How ------------------------------------------------------ */}
      <section className="section section--light">
        <div className="wrap">
          <h2 className="lead">How?</h2>
          <p className="type-body">Buy your belief token.</p>
        </div>
      </section>

      <BuySection />
    </main>
  );
}
