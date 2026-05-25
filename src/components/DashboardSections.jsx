import {
  RECENT_REPORTS,
  TOP_AREAS,
  CONTRIBUTORS,
  AI_INSIGHTS,
  SAFETY_TIPS,
} from "../data/siteData.js";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Contributor from "./Contributor.jsx";
import Link from "next/link";

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
<Link href="/contributor">
        <button
          style={{
            padding: "12px 20px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Open Contributors
        </button>
      </Link>
      <section className="card-elevated message-card" id="about" aria-labelledby="msgHeading">
        <h2 id="msgHeading" className="section-title">
          Our Message
        </h2>
        <p className="message-body">
         RoadVision.pk is a community-driven platform dedicated to improving road safety and infrastructure across Lahore. Our mission is to make it easier for citizens to report potholes, damaged roads, broken streets, and other road-related issues directly from their area. By connecting communities with local authorities, we help highlight road problems that affect daily travel, public safety, and transportation reliability.
        </p>
      </section>
    </div>
  );
}
