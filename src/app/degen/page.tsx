import BuySection from "@/components/BuySection";

export const metadata = {
  title: "Degen — Future Creatives",
  description: "Get in at the founding layer, before the rails are set.",
};

/**
 * Structure is in place and matches the other two persona pages
 * (character → problem → plan → what's at stake → how). Copy is still
 * outstanding — drop it into the marked sections and wrap each multi-paragraph
 * body in <ReadMore>, same as /philanthropist and /impact-investor.
 */
export default function DegenPage() {
  return (
    <main>
      <section className="section section--dark hero">
        <div className="wrap">
          <span className="label">The Degen</span>
          <h1 className="display display--sm">
            Get in at the founding layer, before the rails are set
          </h1>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <span className="label">Copy pending</span>
          <p className="lead">
            This page is built and routed. It needs its words.
          </p>
          <div className="callout">
            <p>
              Send the Degen copy in the same shape as the other two personas
              &mdash; the character, the problem, the plan, what&rsquo;s at
              stake, and how &mdash; and it drops straight in.
            </p>
          </div>
        </div>
      </section>

      <BuySection note="Placeholder — links to the NFT purchase flow" />
    </main>
  );
}
