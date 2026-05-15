import { useState } from "react";

const links = [
  { href: "#dashboard", label: "Dashboard" },
  { href: "#map-section", label: "Live Map" },
  { href: "#reports", label: "Reports" },
  { href: "#contributors", label: "Contributors" },
  { href: "#about", label: "About" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#dashboard" className="brand">
          <span className="brand-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="brand-text">
            RoadVision<span className="brand-dot">.pk</span>
          </span>
        </a>
        <nav className="nav-desktop" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={l.href === "#dashboard" ? "nav-link active" : "nav-link"}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-btn profile-btn" aria-label="User profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <nav className={`nav-mobile${mobileOpen ? " is-open" : ""}`} aria-label="Mobile primary">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
