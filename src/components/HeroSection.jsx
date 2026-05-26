import { useState, useEffect } from "react";
import StatIcon from "./StatIcon.jsx";

export default function HeroSection() {
  const [stats, setStats] = useState({ total: 0, approved: 0, contributors: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const STATS = [
    {
      key: "reports",
      label: "Total Reports",
      value: stats.total.toLocaleString(),
      trend: "All time",
      trendUp: true,
      bar: 78,
      icon: "doc",
    },
    {
      key: "detected",
      label: "Approved & Live",
      value: stats.approved.toLocaleString(),
      trend: "On the map",
      trendUp: true,
      bar: 65,
      icon: "check",
    },
    {
      key: "contributors",
      label: "Contributors",
      value: stats.contributors.toLocaleString(),
      trend: "Unique reporters",
      trendUp: true,
      bar: 50,
      icon: "camera",
    },
  ];

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-badge">Lahore · Citizen &amp; Pothole Safety</p>
        <h1>Pothole Detection &amp; Road Safety Dashboard</h1>
        <p className="hero-sub">Monitor, report, and track road safety across Lahore.</p>
      </div>
      <div className="stats-grid">
        {STATS.map((s) => (
          <article key={s.key} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-icon" aria-hidden="true">
                <StatIcon name={s.icon} />
              </span>
            </div>
            <div className="stat-row">
              <p className="stat-label">{s.label}</p>
              <div className="stat-right">
                <p className="stat-value">{s.value}</p>
                <p className={`stat-trend ${s.trendUp ? "up" : "down"}`}>{s.trend}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}