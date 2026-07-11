import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export function Navbar() {
  const location = useLocation();
  const { displayName, isAuthenticated, logout, citizen, admin } = useAuth();
  const isHome = location.pathname === "/";
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    closeMenu();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl w-full">
      <nav className="relative mx-4 px-6 py-3 flex items-center justify-between bg-white/70 backdrop-blur-xl border border-border rounded-2xl shadow-lg shadow-blue-500/5">
        <Link
          to="/"
          className="flex items-center gap-3 no-underline"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              handleScroll(e, "hero");
            } else {
              closeMenu();
            }
          }}
        >
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-border text-slate-500 hover:bg-white hover:text-primary transition-all focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <i className={`fas ${isOpen ? "fa-times text-lg" : "fa-bars text-lg"}`}></i>
        </button>

        {/* Navigation Menu (Single list styled responsively) */}
        <ul className={`${
          isOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row absolute md:static top-full left-0 right-0 mt-2 md:mt-0 p-5 md:p-0 bg-white/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-border md:border-none rounded-2xl md:rounded-none shadow-xl md:shadow-none items-stretch md:items-center gap-4 md:gap-6 list-none m-0 z-50`}>
          {isHome && (
            <>
              <li>
                <a
                  href="#service"
                  onClick={(e) => handleScroll(e, "service")}
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors block py-2 md:py-0"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleScroll(e, "contact")}
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors block py-2 md:py-0"
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
                onClick={closeMenu}
                className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors block py-2 md:py-0"
              >
                Home
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <>
              <li>
                <Link
                  to={citizen ? "/user/dashboard" : admin ? "/admin/dashboard" : "/worker/dashboard"}
                  onClick={closeMenu}
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors block py-2 md:py-0"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <span className="bg-gradient-to-r from-primary to-accent-cyan text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                  <i className="fas fa-user-circle text-sm"></i>
                  {displayName}
                </span>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="bg-white border border-border text-text-secondary px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:border-error hover:text-error hover:bg-red-50 transition-all w-full md:w-auto text-center"
                >
                  <i className="fas fa-sign-out-alt mr-1.5"></i>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center justify-between md:justify-start gap-4 md:mr-2 border-t md:border-t-0 md:border-r border-border pt-4 md:pt-0 md:pr-6">
                <span className="text-sm text-text-secondary md:hidden">Staff Access:</span>
                <Link
                  to="/staff/login"
                  onClick={closeMenu}
                  className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-border text-slate-400 hover:bg-white hover:text-navy hover:border-slate-300 hover:shadow-sm transition-all"
                  title="Staff Portal"
                >
                  <i className="fas fa-shield-alt group-hover:scale-110 transition-transform"></i>
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="no-underline text-text-secondary text-sm font-medium hover:text-primary transition-colors block py-2.5 md:py-0 text-center md:text-left border md:border-none border-border rounded-xl bg-slate-50 md:bg-transparent"
                >
                  Citizen Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="no-underline bg-gradient-to-r from-primary to-accent-cyan text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all block text-center"
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
