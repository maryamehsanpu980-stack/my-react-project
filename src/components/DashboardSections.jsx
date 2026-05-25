"use client";
import {
  RECENT_REPORTS,
  TOP_AREAS,
  CONTRIBUTORS,
  AI_INSIGHTS,
  SAFETY_TIPS,
} from "../data/siteData.js";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link"; 
import Contributor from "./Contributor"; //



 

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

// 1. ADD THIS ARY DECLARATION RIGHT HERE (Outside the function)
const mockContributors = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `Contributor ${i + 1}`,
  email:`${i + 1}@email.com`
  
}));

const ITEMS_PER_PAGE = 5;

 
export default function DashboardSections() {
 // 1. Local state to track pagination context
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Pagination Math calculations
  const totalPages = Math.ceil(mockContributors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // Slice out the exact 5 items for our current page view
  const currentData = mockContributors.slice(startIndex, endIndex);

  // 3. Action Handlers for the buttons
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
 

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
      <div style={{ padding: "20px", maxWidth: "500px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Dashboard Sections</h2>
      <p>Manage your platform sections and system variables here.</p>

      <hr style={{ margin: "20px 0", borderColor: "#eee" }} />

      {/* Renders the child component, sending only the current slice of items */}
      <Contributor currentData={currentData} />

      {/* Pagination Controls Row */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          style={{
            padding: "6px 12px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            background: currentPage === 1 ? "#ccc" : "var(--teal, #008080)",
            color: "#fff",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Previous
        </button>

        <span style={{ fontWeight: "600" }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          style={{
            padding: "6px 12px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            background: currentPage === totalPages ? "#ccc" : "var(--teal, #008080)",
            color: "#fff",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Next
        </button>
      </div>
    </div>
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
