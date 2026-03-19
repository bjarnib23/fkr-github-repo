import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AlgengarSpurningar.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

function parseLinks(text) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      const href = match[2].startsWith('/') ? match[2] : `/${match[2]}`;
      return <Link key={i} to={href}>{match[1]}</Link>;
    }
    return part;
  });
}

function AlgengarSpurningar() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch(`${DRUPAL_URL}/jsonapi/node/faq?sort=title`)
      .then(res => {
        if (!res.ok) throw new Error('Villa við að sækja gögn');
        return res.json();
      })
      .then(data => {
        setFaqs(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="faq-status">Hleður…</div>;
  if (error) return <div className="faq-status">Villa: {error}</div>;

  return (
    <div className="faq-page">

      <section className="faq-hero">
        <p className="faq-hero-eyebrow">FKR Reykjavík</p>
        <h1>Spurt og svarað</h1>
      </section>

      <div className="faq-list">
        {faqs.map(faq => (
          <div
            key={faq.id}
            className={`faq-item${openId === faq.id ? ' open' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            >
              {faq.attributes.title}
              <span className="faq-toggle">+</span>
            </button>
            <div className="faq-answer">
              <p>{parseLinks(faq.attributes.field_svar)}</p>
            </div>
          </div>
        ))}
        <div className="faq-cta">
          <Link to="/boka-tima" className="btn-primary">Bóka Tíma</Link>
        </div>
      </div>

    </div>
  );
}

export default AlgengarSpurningar;
