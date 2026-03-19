import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './Gjafabref.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

function formatISK(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function Gjafabref() {
  const [amounts, setAmounts] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [form, setForm] = useState({
    upphaed: '',
    nafn_kaupanda: '',
    nafn_vidtakanda: '',
    tolvupostur: '',
    simi: '',
    athugasemd: '',
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    fetch(`${DRUPAL_URL}/jsonapi/node/gjafabref_upphaed?sort=title`)
      .then(res => res.json())
      .then(data => {
        // Sort numerically ascending
        const sorted = data.data.sort((a, b) => {
          const aNum = parseInt(a.attributes.title.replace(/\D/g, ''));
          const bNum = parseInt(b.attributes.title.replace(/\D/g, ''));
          return aNum - bNum;
        });
        setAmounts(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAmountChange(e) {
    setForm(prev => ({ ...prev, upphaed: e.target.value }));
    if (e.target.value !== 'custom') setCustomAmount('');
  }

  const isCustom = form.upphaed === 'custom';
  const finalAmount = isCustom ? customAmount : form.upphaed;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    if (!finalAmount) {
      setError('Vinsamlegast veldu eða sláðu inn upphæð.');
      setStatus('error');
      return;
    }

    try {
      const res = await fetch(`${DRUPAL_URL}/api/gjafabref/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, upphaed: finalAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Villa kom upp. Reyndu aftur.');
        setStatus('error');
      } else {
        window.location.href = data.url;
      }
    } catch {
      setError('Ekki tókst að tengja við þjón. Reyndu aftur.');
      setStatus('error');
    }
  }

  if (success) {
    return (
      <div className="gjafabref-page">
        <div className="gjafabref-success">
          <h1>Greiðsla Tókst!</h1>
          <FaCheckCircle className="gjafabref-success-icon" />
          <p>Þú mátt búast við gjafabréfinu í pósthólfinu þínu.</p>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="gjafabref-page">
        <div className="gjafabref-success">
          <h1>Hætt við greiðslu</h1>
          <p>Þú hættir við greiðsluna. Reyndu aftur ef þig lystir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gjafabref-page">

      <section className="gjafabref-hero">
        <p className="gjafabref-hero-eyebrow">FKR Reykjavík</p>
        <h1>Gjafabréf</h1>
        <p className="gjafabref-hero-sub">
          Gjafabréf FKR er hægt að nýta í allar vörur og sérsaumuð jakkaföt.
          Spurningar? Hafðu samband á <a href="mailto:frodi@fkr.is">frodi@fkr.is</a>.
        </p>
      </section>

      <div className="gjafabref-body">

        <aside className="gjafabref-aside">
          <div className="gjafabref-card-preview">
            <h2>GJAFABRÉF<br />FKR RVK.</h2>
            <p>Hægt að nýta í allar vörur og sérsaumuð jakkaföt hjá FKR Reykjavík.</p>
          </div>
        </aside>

        <div className="gjafabref-form-wrapper">
          <div className="gjafabref-form-header">
            <h2>Kaupa gjafabréf</h2>
            <p>Fylltu út og við staðfestum kaup.</p>
          </div>

          <form className="gjafabref-form" onSubmit={handleSubmit} noValidate>
          <select name="upphaed" value={form.upphaed} onChange={handleAmountChange} required>
            <option value="">Upphæð Gjafabréfs</option>
            {amounts.map(a => {
              const num = parseInt(a.attributes.title.replace(/\D/g, ''));
              return (
                <option key={a.id} value={a.attributes.title}>
                  {formatISK(num)} kr
                </option>
              );
            })}
            <option value="custom">Sérsniðin upphæð</option>
          </select>

          {isCustom && (
            <input
              type="number"
              placeholder="Sláðu inn upphæð (kr) *"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              min="1"
              required
            />
          )}

          <input type="text" name="nafn_kaupanda" placeholder="Nafn: * (Kaupandi)" value={form.nafn_kaupanda} onChange={handleChange} required />
          <input type="text" name="nafn_vidtakanda" placeholder="Nafn: * (Viðtakandi)" value={form.nafn_vidtakanda} onChange={handleChange} required />
          <input type="email" name="tolvupostur" placeholder="Tölvupóstur: *" value={form.tolvupostur} onChange={handleChange} required />
          <input type="tel" name="simi" placeholder="Sími: *" value={form.simi} onChange={handleChange} required />
          <input type="text" name="athugasemd" placeholder="Athugasemd (Valkvætt)" value={form.athugasemd} onChange={handleChange} />

          {status === 'error' && <p className="gjafabref-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Hleður...' : 'Staðfesta'}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Gjafabref;
