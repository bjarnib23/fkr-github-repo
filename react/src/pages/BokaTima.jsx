import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './BokaTima.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

const SERVICES = [
  { id: 'Jakkaföt m. vesti', label: 'Jakkaföt m. vesti' },
  { id: 'Jakkaföt', label: 'Jakkaföt' },
  { id: 'Stakur Jakki', label: 'Stakur Jakki' },
  { id: 'Skyrta', label: 'Skyrta' },
  { id: 'Buxur', label: 'Buxur' },
  { id: 'Vesti', label: 'Vesti' },
  { id: 'Frakkar', label: 'Frakkar' },
  { id: 'Mittisjakki', label: 'Mittisjakki' },
];

const STEPS = ['Þjónusta', 'Upplýsingar', 'Tími', 'Staðfesting'];

const ASIDE = {
  1: {
    heading: 'Sérsaumuð klæði',
    body: 'Við FKR hönnuð við hvert plagg í nánu samstarfi við viðskiptavininn. Veldu þá þjónustu sem hentar þér best og við leiðbeindum þig í gegnum ferlið.',
  },
  2: {
    heading: 'Við höfum samband',
    body: 'Þegar við fáum bókunina höfum við samband við þig til að staðfesta tímann og svara spurningum. Við notum upplýsingarnar eingöngu til að hafa samband við þig.',
  },
  3: {
    heading: 'Fyrsta heimsókn',
    body: 'Á fyrsta tíma tökum við mælingar og ræðum efnisval og hönnun. Áætlaðar þrjár til fjórar heimsóknir eru yfirleitt þær sem þarf til að ljúka sérsaumuðu plaggi.',
  },
  4: {
    heading: 'Yfirlit bókunar',
    body: 'Farðu yfir bókunina þína áður en þú staðfestir. Við höfum samband fljótlega til að staðfesta tímann.',
  },
};

function ProgressBar({ step }) {
  return (
    <div className="boka-progress">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={num} className="boka-progress-item">
            <div className={`boka-progress-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
              {done ? '✓' : num}
            </div>
            <span className={`boka-progress-label ${active ? 'active' : ''}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`boka-progress-line ${done ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}

function BokaTima() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    panta: [],
    nafn: '',
    tolvupostur: '',
    simi: '',
    dagsetning: '',
    athugasemd: '',
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function next() { setStep(s => s + 1); }
  function back() { setStep(s => s - 1); }

  function toggleService(id) {
    setForm(prev => ({
      ...prev,
      panta: prev.panta.includes(id)
        ? prev.panta.filter(x => x !== id)
        : [...prev.panta, id],
    }));
  }

  function step1Valid() { return form.panta.length > 0; }
  function step2Valid() { return form.nafn.trim() && form.tolvupostur.trim() && form.simi.trim(); }
  function step3Valid() { return !!form.dagsetning; }

  async function handleSubmit() {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${DRUPAL_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, panta: form.panta.join(', ') }),
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
          <FaCheckCircle className="boka-success-icon" />
          <h1>Bókun móttekin</h1>
          <p>Við höfum móttekið beiðni þína og munum hafa samband fljótlega til að staðfesta tímann.</p>
        </div>
      </div>
    );
  }

  const aside = ASIDE[step];

  return (
    <div className="boka-page">

      <section className="boka-hero">
        <p className="boka-hero-eyebrow">FKR Reykjavík</p>
        <h1>Bóka Tíma</h1>
        <p className="boka-hero-sub">Við höfum samband til að staðfesta tímann.</p>
      </section>

      <div className="boka-body">

        <aside className="boka-aside">
          <div className="boka-aside-inner">
            <p className="boka-aside-eyebrow">Skref {step} af {STEPS.length}</p>
            <h2 className="boka-aside-heading">{aside.heading}</h2>
            <p className="boka-aside-body">{aside.body}</p>
          </div>
          <div className="boka-aside-contact">
            <p className="boka-aside-contact-label">Spurningar?</p>
            <a href="mailto:frodi@fkr.is">frodi@fkr.is</a>
            <span>691 0040</span>
          </div>
        </aside>

        <div className="boka-form-wrapper">
          <ProgressBar step={step} />

          {/* Step 1 — Service */}
          {step === 1 && (
            <div className="boka-step-content">
              <h2>Hvað viltu panta?</h2>
              <div className="boka-service-grid">
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`boka-service-card${form.panta.includes(s.id) ? ' selected' : ''}`}
                    onClick={() => toggleService(s.id)}
                  >
                    <strong>{s.label}</strong>
                    <span>{s.desc}</span>
                  </button>
                ))}
              </div>
              <div className="boka-nav">
                <span />
                <button className="btn-primary" onClick={next} disabled={!step1Valid()}>Áfram</button>
              </div>
            </div>
          )}

          {/* Step 2 — Contact info */}
          {step === 2 && (
            <div className="boka-step-content">
              <h2>Tengiliðaupplýsingar</h2>
              <div className="boka-fields">
                <input type="text" name="nafn" placeholder="Nafn *" value={form.nafn} onChange={handleChange} required />
                <input type="email" name="tolvupostur" placeholder="Tölvupóstur *" value={form.tolvupostur} onChange={handleChange} required />
                <input type="tel" name="simi" placeholder="Sími *" value={form.simi} onChange={handleChange} required />
              </div>
              <div className="boka-nav">
                <button className="btn-outline" onClick={back}>Til baka</button>
                <button className="btn-primary" onClick={next} disabled={!step2Valid()}>Áfram</button>
              </div>
            </div>
          )}

          {/* Step 3 — Date & notes */}
          {step === 3 && (
            <div className="boka-step-content">
              <h2>Tími og athugasemdir</h2>
              <div className="boka-fields">
                <div className="boka-date-wrapper">
                  <label className="boka-date-label">Hvenær viltu koma?</label>
                  <input type="date" name="dagsetning" value={form.dagsetning} onChange={handleChange} />
                </div>
                <textarea
                  name="athugasemd"
                  placeholder="Athugasemd (valkvætt)"
                  value={form.athugasemd}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <div className="boka-nav">
                <button className="btn-outline" onClick={back}>Til baka</button>
                <button className="btn-primary" onClick={next} disabled={!step3Valid()}>Áfram</button>
              </div>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {step === 4 && (
            <div className="boka-step-content">
              <h2>Staðfesting</h2>
              <div className="boka-summary">
                <div className="boka-summary-row">
                  <span>Þjónusta</span>
                  <strong>{form.panta.join(', ')}</strong>
                </div>
                <div className="boka-summary-row">
                  <span>Nafn</span>
                  <strong>{form.nafn}</strong>
                </div>
                <div className="boka-summary-row">
                  <span>Tölvupóstur</span>
                  <strong>{form.tolvupostur}</strong>
                </div>
                <div className="boka-summary-row">
                  <span>Sími</span>
                  <strong>{form.simi}</strong>
                </div>
                <div className="boka-summary-row">
                  <span>Dagsetning</span>
                  <strong>{form.dagsetning}</strong>
                </div>
                {form.athugasemd && (
                  <div className="boka-summary-row">
                    <span>Athugasemd</span>
                    <strong>{form.athugasemd}</strong>
                  </div>
                )}
              </div>
              {error && <p className="boka-error">{error}</p>}
              <div className="boka-nav">
                <button className="btn-outline" onClick={back}>Til baka</button>
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Hleður...' : 'Staðfesta bókun'}
                </button>
              </div>
              <p className="boka-note">Nákvæmari staðfesting mályst þegar tími er staðfestur.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default BokaTima;
