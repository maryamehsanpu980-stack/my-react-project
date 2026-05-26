import { SEARCHABLE_AREAS } from "../data/siteData.js";

const chipAreas = SEARCHABLE_AREAS.slice(0, 10);

export default function ControlPanel({ searchQuery, setSearchQuery, onOpenModal, searchResults, searching, searched, onClear, onSearchSubmit }) {
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
            placeholder="Area, road name…"
            autoComplete="off"
            list="lahoreAreas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit(searchQuery);
            }}
          />
          <datalist id="lahoreAreas">
            {SEARCHABLE_AREAS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <p className="search-hint">Try Gulberg, DHA, Johar Town, Canal Road.</p>

        {searching && <p style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>Searching...</p>}

        {searched && !searching && (
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              {searchResults.length > 5 && ' (showing top 5)'}
            </p>
            {searchResults.length > 0 && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {searchResults.slice(0, 5).map((r) => (
                  <li key={r.id} style={{
                    fontSize: '0.82rem', padding: '0.5rem 0.65rem',
                    background: 'var(--off-white)', borderRadius: '8px',
                    borderLeft: `3px solid ${r.severity === 'high' ? '#ef4444' : r.severity === 'medium' ? '#f97316' : '#22c55e'}`
                  }}>
                    <strong>{r.location_text || 'Unknown area'}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>· {r.severity}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={onClear}
              style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--teal-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Clear search
            </button>
          </div>
        )}

        <button type="button" className="btn-primary btn-add-report" onClick={onOpenModal} style={{ marginTop: '1rem' }}>
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
              onClick={() => { setSearchQuery(a); onSearchSubmit(a); }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}