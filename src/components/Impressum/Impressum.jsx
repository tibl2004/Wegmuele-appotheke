import React from "react";
import "./Impressum.scss";

export default function Impressum() {
  return (
    <div className="impressum">
      <h1>Impressum</h1>

      <section>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          <strong>TBs Solutions</strong><br />
          Timo Blumer<br />
          3001 Bern<br />
          Schweiz
        </p>
        <p><strong>Vertreten durch:</strong> Timo Blumer</p>
        <p>
          <strong>Website:</strong>{" "}
          <a href="https://www.tbs-solutions.ch" target="_blank" rel="noopener noreferrer">
            www.tbs-solutions.ch
          </a>
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          <strong>Telefon:</strong> +41 79 809 00 55<br />
          <strong>E-Mail:</strong>{" "}
          <a href="mailto:timo.blumer@gmx.ch">timo.blumer@gmx.ch</a><br />
          <strong>Website:</strong>{" "}
          <a href="https://www.tbs-solutions.ch" target="_blank" rel="noopener noreferrer">
            www.tbs-solutions.ch
          </a>
        </p>
      </section>

      <section>
        <h2>Haftung für Inhalte</h2>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die
          Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
          jedoch keine Gewähr übernehmen.
        </p>
      </section>

      <section>
        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
          wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte
          auch keine Gewähr übernehmen.
        </p>
      </section>

      <section>
        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche
          gekennzeichnet. Besuchen Sie unsere Website: <br></br>
          <a href="https://www.tbs-solutions.net" target="_blank" rel="noopener noreferrer">
            www.tbs-solutions.net
          </a>
        </p>
      </section>
    </div>
  );
}
