import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav>
      <div className="navbar-logo">
        <NavLink to="/">FKR Rvk.</NavLink>
      </div>
      <ul>
        <li><NavLink to="/boka-tima" className={({ isActive }) => isActive ? 'active' : ''}>Bóka Tíma</NavLink></li>
        <li><NavLink to="/ferlid" className={({ isActive }) => isActive ? 'active' : ''}>Ferlið</NavLink></li>
        <li><NavLink to="/algengar-spurningar" className={({ isActive }) => isActive ? 'active' : ''}>Algengar spurningar</NavLink></li>
        <li><NavLink to="/gjafabref" className={({ isActive }) => isActive ? 'active' : ''}>Gjafabréf</NavLink></li>
        <li><NavLink to="/verdskra" className={({ isActive }) => isActive ? 'active' : ''}>Verðskrá</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
