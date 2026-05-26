import L from 'leaflet';

const COLORS = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };

export function createMarkerIcon(severity = 'low') {
  const color = COLORS[severity] || COLORS.low;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px; height:14px;
      background:${color};
      border:2px solid #fff;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}