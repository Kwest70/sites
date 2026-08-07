import BuySection from "@/components/BuySection";

export const metadata = {
  title: "A Hip Hop Story — Future Creatives",
  description:
    "The first project built with the model. 25 years since it premiered, in 2028.",
};

/**
 * The project page. Structure is in place and routed; copy is still
 * outstanding. Wrap each multi-paragraph body in <ReadMore> when it lands.
 */
export default function HipHopStoryPage() {
  return (
    <main>
      <section className="section section--dark hero">
        <div className="wrap">
          <span className="label">The Project</span>
          <h1 className="display display--sm">A Hip Hop Story</h1>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <span className="label">Copy pending</span>
          <p className="lead">
            The live show and the roadmap, built with the exact model
            we&rsquo;re inviting you into.
          </p>
          <div className="callout">
            <p>
              Celebrating its 25th anniversary in 2028 since it premiered. Send
              the project copy and it drops straight in.
            </p>
          </div>
        </div>
      </section>

      <BuySection note="Placeholder — links to the NFT purchase flow" />
    </main>
  );
}
