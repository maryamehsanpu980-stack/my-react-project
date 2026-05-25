export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#dashboard" className="brand brand-footer">
            <span className="brand-icon">
              <svg width="24" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </div>
        <div>
          <h3 className="footer-heading">Quick links</h3>
          <ul className="footer-links">
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#map-section">Live Map</a></li>
            <li><a href="#reports">Reports</a></li>
            <li><a href="#contributors">Contributors</a></li>
          </ul>
        </div>
        <div>
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links">
            <li>
              <a href="mailto:hello@roadvision.pk">helloo@roadvision.pk</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} RoadVision.pk · Built for safer Lahore roads.</p>
      </div>
    </footer>
  );
}
