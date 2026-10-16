import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        📲 SmartPesa
      </NavLink>
      {user && (
        <>
          <button
            className="nav-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? 'Close menu' : 'Menu'}</span>
            <span className="nav-menu-icon" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
          </button>
          <ul id="primary-navigation" className={`nav-links${menuOpen ? ' is-open' : ''}`}>
            <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/budget" onClick={() => setMenuOpen(false)}>Budget</NavLink></li>
            <li><NavLink to="/transactions" onClick={() => setMenuOpen(false)}>Transactions</NavLink></li>
            <li><NavLink to="/analysis" onClick={() => setMenuOpen(false)}>Analysis</NavLink></li>
            <li><NavLink to="/settings" onClick={() => setMenuOpen(false)}>Settings</NavLink></li>
            <li><span style={{ opacity: 0.8 }}>{user.name}</span></li>
            <li>
              <button className="button-text-danger" type="button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </>
      )}
    </nav>
  );
}