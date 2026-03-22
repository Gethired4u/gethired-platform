import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/resume-check", label: "Resume Check" },
  { to: "/register", label: "Register" },
  { to: "/admin", label: "Admin" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-ink">
          GetHired4U <span className="gradient-text">AI</span>
        </Link>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Menu
        </button>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${isActive ? "text-brand-600" : "text-slate hover:text-ink"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get Started
          </Link>
        </nav>
      </div>

      {isOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold ${isActive ? "text-brand-600" : "text-slate"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
