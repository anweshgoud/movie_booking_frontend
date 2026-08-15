import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        CineBook
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>
          Movies
        </NavLink>
        <NavLink to="/lookup">Find Booking</NavLink>
      </nav>
    </header>
  );
}
