"use client";

import React, { useEffect, useState } from "react";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

const ITEMS_PER_PAGE = 5;

export default function DashboardSections() {
  const [contributors, setContributors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadContributors() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/contributors", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load contributors (${response.status})`);
        }

        const data = await response.json();
        setContributors(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Failed to load contributors");
        }
      } finally {
        setLoading(false);
      }
    }

    loadContributors();

    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(contributors.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = contributors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNext = () => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  const handlePrev = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  return (
    <div className="lower-grid">
      <section className="card-elevated" id="contributors" aria-labelledby="contribHeading">
        <h2 id="contribHeading" className="section-title">
          Contributors
        </h2>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading contributors...</p>
        ) : error ? (
          <p style={{ color: "#b91c1c" }}>{error}</p>
        ) : currentData.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No contributors found yet.</p>
        ) : (
          <>
            <ul className="contributor-list">
              {currentData.map((contributor) => {
                return (
                  <li key={contributor.name} className="contrib-row">
                    <div className="contrib-avatar" aria-hidden="true">
                      {initials(contributor.name)}
                    </div>
                    <div className="contrib-info">
                      <p className="contrib-name">{contributor.name}</p>
                      <p className="contrib-meta">
                        {contributor.email}
                        <span style={{ marginLeft: "0.4rem" }}>· {contributor.report_count} reports</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {contributors.length > ITEMS_PER_PAGE && (
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
                    borderRadius: "4px",
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
                    borderRadius: "4px",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

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
