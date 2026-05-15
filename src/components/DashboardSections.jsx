import {
  RECENT_REPORTS,
  TOP_AREAS,
  CONTRIBUTORS,
  AI_INSIGHTS,
  SAFETY_TIPS,
} from "../data/siteData.js";

function rankClass(rank) {
  if (rank === "Top Contributor") return "contrib-badge rank-top";
  if (rank === "Active Contributor") return "contrib-badge rank-active";
  return "contrib-badge rank-new";
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export default function DashboardSections() {
  return (
    <div className="lower-grid">
      <section className="card-elevated" id="reports" aria-labelledby="recentHeading">
        <div className="card-head">
          <h2 id="recentHeading" className="section-title">
            Recent Reports
          </h2>
          <a href="#reports" className="text-link">
            View all
          </a>
        </div>
        <ul className="report-list">
          {RECENT_REPORTS.map((r) => (
            <li key={`${r.area}-${r.time}`} className="report-item">
              <img className="report-thumb" src={r.img} alt="" loading="lazy" width="64" height="64" />
              <div className="report-body">
                <h3>{r.area}</h3>
                <p className="report-meta">{r.time}</p>
                <p className="report-desc">{r.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-elevated" aria-labelledby="areasHeading">
        <h2 id="areasHeading" className="section-title">
          Top Affected Areas
        </h2>
        <ol className="ranked-list">
          {TOP_AREAS.map((a) => (
            <li key={a.name}>
              <span>{a.name}</span>
              <span className="count">{a.count} reports</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-elevated" id="contributors" aria-labelledby="contribHeading">
        <h2 id="contribHeading" className="section-title">
          Contributors
        </h2>
        <ul className="contributor-list">
          {CONTRIBUTORS.map((c) => (
            <li key={c.name} className="contrib-row">
              <div className="contrib-avatar" aria-hidden="true">
                {initials(c.name)}
              </div>
              <div className="contrib-info">
                <p className="contrib-name">{c.name}</p>
                <p className="contrib-meta">
                  {c.area} · {c.reports} reports
                </p>
              </div>
              <span className={rankClass(c.rank)}>{c.rank}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-elevated insights-card" aria-labelledby="aiHeading">
        <h2 id="aiHeading" className="section-title">
          AI Detection Insights
        </h2>
        <ul className="insight-metrics">
          {AI_INSIGHTS.map((i) => (
            <li key={i.label} className="insight-row">
              <span>{i.label}</span>
              <strong>{i.value}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-elevated tips-card" aria-labelledby="tipsHeading">
        <h2 id="tipsHeading" className="section-title">
          Road Safety Tips
        </h2>
        <ul className="tips-list">
          {SAFETY_TIPS.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="card-elevated message-card" id="about" aria-labelledby="msgHeading">
        <h2 id="msgHeading" className="section-title">
          Our Message
        </h2>
        <p className="message-body">
          RoadVision.pk helps Lahore citizens report potholes easily and supports{" "}
          <strong>AI-powered road damage detection</strong> so authorities and communities can prioritize repairs.
          Together we make city roads safer, more predictable, and more reliable for everyone who lives and travels here.
        </p>
      </section>
    </div>
  );
}
