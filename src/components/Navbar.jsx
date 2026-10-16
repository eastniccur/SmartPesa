import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        📲 M-Pesa Analyzer
      </NavLink>
      <ul className="nav-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/transactions">Transactions</NavLink></li>
        <li><NavLink to="/budget">Budget</NavLink></li>
        <li><NavLink to="/analysis">Analysis</NavLink></li>
        <li><NavLink to="/settings">Settings</NavLink></li>
      </ul>
      {user && (
        <div className="navbar-account">
          <span>{user.name}</span>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      )}
    </nav>
  );
}
