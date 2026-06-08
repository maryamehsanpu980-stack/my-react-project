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
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLinkClick = (href) => {
    const sectionName = href.replace("#", "");
    setActiveSection(sectionName);
    setMobileOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href="#dashboard"
          className="brand-link"
          onClick={() => handleLinkClick("#dashboard")}
        >
          RoadVision
        </a>

        <nav className="nav-desktop" aria-label="Main navigation">
          {links.map((link) => {
            const sectionName = link.href.replace("#", "");
            const isActive = activeSection === sectionName;

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </a>
            );
          })}
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

      {mobileOpen && (
        <nav className="nav-mobile" aria-label="Mobile navigation">
          {links.map((link) => {
            const sectionName = link.href.replace("#", "");
            const isActive = activeSection === sectionName;

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      )}
    </header>
  );
}