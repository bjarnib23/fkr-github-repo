import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fkrHero from '../assets/FKR_Fullt logo - update.svg';
import './Forsida.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

function Forsida() {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetch(`${DRUPAL_URL}/jsonapi/node/siduefni?filter[title]=Forsíða&include=field_mynd,field_mynd.field_media_image`)
      .then(res => res.json())
      .then(data => {
        if (data.included) {
          const file = data.included.find(item => item.type === 'file--file');
          if (file) setPhotoUrl(DRUPAL_URL + file.attributes.uri.url);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="forsida">

      {/* Hero - dark green with FKR logo */}
      <section className="forsida-hero">
        <img src={fkrHero} alt="FKR Reykjavík - Sígild klæði" />
      </section>

      {/* Middle section - photo + CTA */}
      <section className="forsida-cta">
        <div className="forsida-cta-photo">
          {photoUrl
            ? <img src={photoUrl} alt="Forsíða" />
            : <div className="forsida-photo-placeholder" />
          }
        </div>
        <div className="forsida-cta-text">
          <p className="forsida-cta-eyebrow">FKR Reykjavík — Sérsaumuð klæði</p>
          <h1>Jakkaföt <em>sérhönnuð</em> þér</h1>
          <p className="forsida-cta-body">
            Sérsaumuð jakkaföt, mótuð eftir þínum mælingum og stíl.
            Tímalaus gæði fyrir þá sem vilja meira.
          </p>
          <Link to="/boka-tima" className="btn-primary">Bóka Tíma</Link>
        </div>
      </section>

    </div>
  );
}

export default Forsida;
