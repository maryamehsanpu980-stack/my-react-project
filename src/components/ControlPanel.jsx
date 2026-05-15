import { SEARCHABLE_AREAS } from "../data/siteData.js";

const chipAreas = SEARCHABLE_AREAS.slice(0, 10);

export default function ControlPanel({ searchQuery, setSearchQuery, onOpenModal }) {
  return (
    <aside className="control-panel" aria-label="Search and actions">
      <div className="panel-card">
        <label className="field-label" htmlFor="searchInput">
          Search Lahore
        </label>
        <div className="search-wrap">
          <span className="search-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="search"
            id="searchInput"
            className="search-input"
            placeholder="Area, road name, or report ID…"
            autoComplete="off"
            list="lahoreAreas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <datalist id="lahoreAreas">
            {SEARCHABLE_AREAS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <p className="search-hint">Try Gulberg, DHA, Johar Town, Ferozepur Road, Canal Road, or a report ID.</p>
        <button type="button" className="btn-primary btn-add-report" onClick={onOpenModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New Report
        </button>
      </div>
      <div className="panel-card quick-filters">
        <h3 className="panel-title">Popular areas</h3>
        <div className="chip-row">
          {chipAreas.map((a) => (
            <button
              key={a}
              type="button"
              className="area-chip"
              onClick={() => setSearchQuery(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
