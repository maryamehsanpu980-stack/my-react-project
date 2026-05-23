export function formatReport(row) {
  return {
    id: row.id,
    area: row.location_text || `${row.lat.toFixed(4)}, ${row.lng.toFixed(4)}`,
    lat: row.lat,
    lng: row.lng,
    severity: row.severity,
    confidence: row.confidence,
    source: row.source,
    contributor: row.contributor_name || 'Anonymous',
    createdAt: new Date(row.created_at).toLocaleDateString(),
  };
}