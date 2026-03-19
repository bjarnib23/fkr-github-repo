import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-info">
        <p><strong>Upplýsingar</strong></p>
        <p>Fossvogur, Reykjavík</p>
        <p>kt: 550825-0150</p>
        <p>Sími: 691 0040</p>
        <a href="mailto:frodi@fkr.is">frodi@fkr.is</a>
      </div>
      <div className="site-footer-social">
        <a href="https://facebook.com/jokullogco" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
        <a href="https://instagram.com/fkrrvk" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
        <a href="https://tiktok.com/@fkrrvk" target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok /></a>
      </div>
      <div className="site-footer-copy">
        <p>© 2026, <a href="https://fkr.is" target="_blank" rel="noreferrer">FKR Reykjavík</a></p>
      </div>
    </footer>
  );
}

export default Footer;
