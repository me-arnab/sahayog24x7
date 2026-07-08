import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const logoText = (
  <>
    <span className="font-[Geom] font-semibold text-[30px] text-[#111]">
      Sahayog
    </span>
    <span className="font-[Geom] font-semibold text-[30px] text-[rgb(255,103,2)]">
      24
    </span>
    <span className="font-[Geom] font-semibold text-[30px] text-[rgb(25,159,255)]">
      x
    </span>
    <span className="font-[Geom] font-semibold text-[30px] text-[rgb(0,136,50)]">
      7
    </span>
  </>
);

export function Navbar() {
  const location = useLocation();
  const { worker, isAuthenticated, logout } = useAuth();
  const isHome = location.pathname === "/";

  return (
    <header className="w-full px-[60px] py-5 flex items-center justify-between bg-transparent max-md:px-7 max-md:py-4">
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <div className="flex items-center gap-2.5">
          <img
            src="/frontend/assets/logo.png"
            className="w-[50px] h-[50px]"
            alt="logo"
          />
          {logoText}
        </div>
      </Link>

      <nav>
        <ul className="flex list-none gap-7 items-center max-md:gap-4 m-0 p-0">
          {isHome && (
            <>
              <li>
                <a
                  href="#service"
                  className="no-underline text-[#222] font-medium"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="no-underline text-[#222] font-medium"
                >
                  Contact Us
                </a>
              </li>
            </>
          )}
          {!isHome && (
            <li>
              <Link to="/" className="no-underline text-[#222] font-medium">
                Home
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <>
              <li>
                <Link
                  to="/worker/dashboard"
                  className="no-underline font-medium"
                >
                  <span className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">
                    👤 {worker?.name}
                  </span>
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="bg-transparent border-2 border-[#e2e8f0] px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:border-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-white"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="no-underline text-[#222] font-medium">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="no-underline bg-black text-white px-5 py-2.5 rounded-3xl font-bold text-sm inline-block"
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
