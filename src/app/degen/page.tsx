"use client";

import "./page.css";

export default function DegenPage() {
  return (
    <main className="persona-page">
      {/* HEADLINE */}
      <section className="section-full section-dark headline-section">
        <div className="content-max">
          <h1 className="type-display">Degen</h1>
          <p className="subheading">
            Own a piece of the culture you believe in.
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="section-full section-light">
        <div className="content-max">
          <p className="type-body">
            This page is coming soon. The Degen persona content will be added here.
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
