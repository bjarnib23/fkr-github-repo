import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './BokaTima.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

function BokaTima() {
  const [form, setForm] = useState({
    nafn: '',
    tolvupostur: '',
    simi: '',
    panta: '',
    dagsetning: '',
    athugasemd: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`${DRUPAL_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Villa kom upp. Reyndu aftur.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setError('Ekki tókst að tengja við þjón. Reyndu aftur.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="boka-page">
        <div className="boka-success">
          <h1>Bókun móttekin</h1>
          <FaCheckCircle className="boka-success-icon" />
          <p>Við höfum móttekið beiðni þína og munum hafa samband fljótlega til að staðfesta tímann.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="boka-page">
      <div className="boka-form-wrapper">
        <h1>Bóka Tíma</h1>
        <p className="boka-subtitle">Fylltu út eftirfarandi og við höfum samband til að staðfesta tímann.</p>

        <form className="boka-form" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="nafn"
            placeholder="Nafn *"
            value={form.nafn}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="tolvupostur"
            placeholder="Tölvupóstur *"
            value={form.tolvupostur}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="simi"
            placeholder="Sími *"
            value={form.simi}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="panta"
            placeholder="Hvað viltu panta?"
            value={form.panta}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dagsetning"
            placeholder="Hvenær þarftu að nota fötin?"
            value={form.dagsetning}
            onChange={handleChange}
          />
          <textarea
            name="athugasemd"
            placeholder="Athugasemd (valkvætt)"
            value={form.athugasemd}
            onChange={handleChange}
            rows={3}
          />

          {status === 'error' && <p className="boka-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Hleður...' : 'Bóka'}
          </button>

          <p className="boka-note">Nákvæmari staðfesting mályst þegar tími er staðfestur.</p>
        </form>
      </div>
    </div>
  );
}

export default BokaTima;
