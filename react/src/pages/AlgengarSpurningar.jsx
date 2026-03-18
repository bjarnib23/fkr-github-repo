import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AlgengarSpurningar.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

function AlgengarSpurningar() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="faq-status">Hleður...</div>;
  if (error) return <div className="faq-status">Villa: {error}</div>;

  return (
    <div className="faq-page">
      <h1>Spurt og svarað</h1>

      <div className="faq-grid">
        {faqs.map(faq => (
          <div key={faq.id} className="faq-card">
            <h3>{faq.attributes.title}</h3>
            <p>{faq.attributes.field_svar}</p>
          </div>
        ))}
      </div>

      <div className="faq-cta">
        <Link to="/boka-tima" className="btn-primary">Bóka Tíma</Link>
      </div>
    </div>
  );
}

export default AlgengarSpurningar;
