/**
 * The single call to action. Ends every page and nothing comes after it.
 * "#get-belief-token" is a placeholder for the real NFT purchase flow —
 * swap the href here and it changes on all five pages at once.
 */
export default function BuySection({ note }: { note?: string }) {
  return (
    <section className="section section--ink" id="get-belief-token">
      <div className="wrap">
        <a href="#get-belief-token" className="buy">
          Buy Belief
        </a>
        {note ? <p className="buy-note">{note}</p> : null}
      </div>
    </section>
  );
}
