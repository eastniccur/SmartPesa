import { NavLink } from 'react-router-dom';

function Navbar() {
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
    </nav>
  );
}

export default Navbar;