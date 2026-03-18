import { Link } from 'react-router-dom';
import fkrHero from '../assets/FKR_Fullt logo - update.svg';
import './Forsida.css';

function Forsida() {
  return (
    <div className="forsida">

      {/* Hero - dark green with FKR logo */}
      <section className="forsida-hero">
        <img src={fkrHero} alt="FKR Reykjavík - Sígild klæði" />
      </section>

      {/* Middle section - photo + CTA */}
      <section className="forsida-cta">
        <div className="forsida-cta-photo">
          {/* Dynamic photo from Drupal will go here */}
          <div className="forsida-photo-placeholder" />
        </div>
        <div className="forsida-cta-text">
          <h1>Sérsaumuð jakkafót</h1>
          <Link to="/boka-tima" className="btn-primary">Bóka Tíma</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="forsida-footer">
        <p><strong>Upplýsingar</strong></p>
        <p>Fossvogur, Reykjavík</p>
        <p>kt: 550825-0150</p>
        <p>Sími: 691 0040</p>
      </footer>

    </div>
  );
}

export default Forsida;
