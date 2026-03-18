import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Ferlid.css';

const DRUPAL_URL = 'http://fkr-web.ddev.site';

function Ferlid() {
  const [content, setContent] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${DRUPAL_URL}/jsonapi/node/siduefni?filter[title]=Ferlið&include=field_mynd,field_mynd.field_media_image`)
      .then(res => res.json())
      .then(data => {
        if (data.data.length > 0) {
          setContent(data.data[0].attributes);
          if (data.included) {
            const file = data.included.find(item => item.type === 'file--file');
            if (file) setPhotoUrl(DRUPAL_URL + file.attributes.uri.url);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ferlid-status">Hleður...</div>;

  return (
    <div className="ferlid-page">
      <div className="ferlid-photo">
        {photoUrl
          ? <img src={photoUrl} alt="Ferlið" />
          : <div className="ferlid-photo-placeholder" />
        }
      </div>
      <div className="ferlid-text">
        <h1>{content?.title}</h1>
        {content?.field_texti?.split('\n').filter(p => p.trim()).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="ferlid-cta">
          <Link to="/boka-tima" className="btn-primary">Bóka Tíma</Link>
        </div>
      </div>
    </div>
  );
}

export default Ferlid;
