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

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "×" : "☰"}
        </button>
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