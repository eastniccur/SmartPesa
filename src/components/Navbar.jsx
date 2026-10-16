import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        📲 SmartPesa
      </NavLink>
      {user && (
        <ul className="nav-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/budget">Budget</NavLink></li>
          <li><NavLink to="/transactions">Transactions</NavLink></li>
          <li><NavLink to="/analysis">Analysis</NavLink></li>
          <li><NavLink to="/settings">Settings</NavLink></li>
          <li><span style={{ opacity: 0.8 }}>{user.name}</span></li>
          <li><button className="button-text-danger" type="button" onClick={handleLogout}>Logout</button></li>
        </ul>
      )}
    </nav>
  );
}