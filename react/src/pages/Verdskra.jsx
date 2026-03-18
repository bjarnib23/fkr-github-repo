import { useState, useEffect } from 'react';
import './Verdskra.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';
const GRADES = ['AA', 'A', 'B', 'BB', 'C', 'D', 'E', 'F', 'G', 'GG', 'H', 'HH', 'I', 'J', 'JJ', 'K', 'L', 'R'];

function formatPrice(value) {
  if (!value) return '';
  return value.toLocaleString('is-IS');
}

function Verdskra() {
  const [pageContent, setPageContent] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = fetch(`${DRUPAL_URL}/jsonapi/node/siduefni?filter[title]=Efnin&include=field_mynd,field_mynd.field_media_image`)
      .then(res => res.json())
      .then(data => {
        if (data.data.length > 0) {
          setPageContent(data.data[0].attributes);
          if (data.included && data.included.length > 0) {
            const file = data.included.find(item => item.type === 'file--file');
            if (file) setPhotoUrl(DRUPAL_URL + file.attributes.uri.url);
          }
        }
      });

    const fetchPrices = fetch(`${DRUPAL_URL}/jsonapi/node/verdskra_lina?sort=field_rodun`)
      .then(res => res.json())
      .then(data => setRows(data.data));

    Promise.all([fetchPage, fetchPrices])
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="verdskra-status">Hleður...</div>;

  return (
    <div className="verdskra-page">

      {/* Fabric info section */}
      <section className="verdskra-efni">
        <div className="verdskra-efni-photo">
          {photoUrl
            ? <img src={photoUrl} alt="Efni" />
            : <div className="verdskra-photo-placeholder" />
          }
        </div>
        <div className="verdskra-efni-text">
          <h1>{pageContent?.title}</h1>
          {pageContent?.field_texti?.split('\n').filter(p => p.trim()).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Price table */}
      <section className="verdskra-tafla-section">
        <div className="verdskra-tafla-wrapper">
          <table className="verdskra-tafla">
            <thead>
              <tr>
                <th></th>
                {GRADES.map(g => <th key={g}>{g}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td className="verdskra-vara">{row.attributes.title}</td>
                  {GRADES.map(g => (
                    <td key={g}>
                      {formatPrice(row.attributes[`field_verd_${g.toLowerCase()}`])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

export default Verdskra;
