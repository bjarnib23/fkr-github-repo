import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <div className="navbar-logo">
        <Link to="/">FKR Rvk.</Link>
      </div>
      <ul>
        <li><Link to="/boka-tima">Bóka Tíma</Link></li>
        <li><Link to="/ferlid">Ferlið</Link></li>
        <li><Link to="/algengar-spurningar">Algengar spurningar</Link></li>
        <li><Link to="/gjafabref">Gjafabréf</Link></li>
        <li><Link to="/verdskra">Verðskrá</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
