import React from "react";
import "./Impressum.scss";

export default function Impressum() {
  return (
    <div className="impressum">
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        Musterfirma GmbH<br />
        Musterstraße 1<br />
        12345 Musterstadt<br />
        Deutschland
      </p>

      <p>Vertreten durch: Max Mustermann</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: +49 (0) 123 4567890<br />
        E-Mail: info@musterfirma.de
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz: DE123456789
      </p>

      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        Max Mustermann<br />
        Musterstraße 1<br />
        12345 Musterstadt
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die
        Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
        jedoch keine Gewähr übernehmen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
        wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte
        auch keine Gewähr übernehmen.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
        unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche
        gekennzeichnet.
      </p>
    </div>
  );
}
