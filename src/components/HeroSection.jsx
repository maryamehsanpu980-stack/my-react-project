import StatIcon from "./StatIcon.jsx";
import { STATS } from "../data/siteData.js";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-badge">Lahore · Citizen &amp; AI road intelligence</p>
        <h1>Pothole Detection &amp; Road Safety Dashboard</h1>
        <p className="hero-sub">Monitor, report, and track road damage across Lahore.</p>
      </div>
      <div className="stats-grid">
        {STATS.map((s) => (
          <article key={s.key} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-icon" aria-hidden="true">
                <StatIcon name={s.icon} />
              </span>
            </div>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p className={`stat-trend ${s.trendUp ? "up" : "down"}`}>
              {s.trend}
              <span className="bar" aria-hidden="true">
                <span style={{ width: `${s.bar}%` }} />
              </span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
