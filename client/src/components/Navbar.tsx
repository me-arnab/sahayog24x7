import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export function Navbar() {
  const location = useLocation();
  const { displayName, isAuthenticated, logout } = useAuth();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl">
      <nav className="mx-4 px-6 py-3 flex items-center justify-between bg-white/70 backdrop-blur-xl border border-border rounded-2xl shadow-lg shadow-blue-500/5">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img
            src={logo}
            className="w-10 h-10 rounded-lg"
            alt="Sahayog24x7 Logo"
          />
          <span className="text-xl font-bold text-navy">
            Sahayog<span className="text-primary">24</span>
            <span className="text-accent-cyan">x7</span>
          </span>
        </Link>

        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {isHome && (
            <>
              <li>
                <a
                  href="#service"
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </>
          )}

          {!isHome && (
            <li>
              <Link
                to="/"
                className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <>
              <li>
                <span className="bg-gradient-to-r from-primary to-accent-cyan text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2">
                  <i className="fas fa-user-circle text-sm"></i>
                  {displayName}
                </span>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="bg-white border border-border text-text-secondary px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:border-error hover:text-error hover:bg-red-50 transition-all"
                >
                  <i className="fas fa-sign-out-alt mr-1.5"></i>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="no-underline bg-gradient-to-r from-primary to-accent-cyan text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
