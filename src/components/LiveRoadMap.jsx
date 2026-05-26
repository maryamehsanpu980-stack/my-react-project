import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useReports } from "../hooks/useReports.js"; // ← changed

const OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// ← changed: now takes reports as param instead of using MAP_POINTS
function filterPoints(query, reports = []) {
  const q = (query || "").trim().toLowerCase();
  const reportIdSearch =
    q.startsWith("rv-") || q.startsWith("#") || /^rpt-?\d/i.test(q) || q === "report";
  if (!q || reportIdSearch) return reports;
  return reports.filter((p) =>
    (p.location_text || "").toLowerCase().includes(q)
  );
}

function MapBridge({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => { mapRef.current = null; };
  }, [map, mapRef]);
  return null;
}

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function FlyToSearch({ searchQuery, reports }) { // ← changed: takes reports
  const map = useMap();
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    const reportIdSearch =
      q.startsWith("rv-") || q.startsWith("#") || /^rpt-?\d/i.test(q) || q === "report";
    if (!q || reportIdSearch) return;
    const first = reports.find((p) => (p.location_text || "").toLowerCase().includes(q));
    if (first) map.setView([first.lat, first.lng], 14);
  }, [searchQuery, map, reports]);
  return null;
}

function LocateListener() {
  const map = useMap();
  useEffect(() => {
    const onFound = (e) => {
      L.circleMarker(e.latlng, {
        radius: 8, color: "#0d9488", fillColor: "#0d9488", fillOpacity: 0.25,
      }).addTo(map).bindPopup("You are here (approx.)").openPopup();
    };
    const onErr = () => {
      console.warn("Location permission denied or unavailable.");
    };
    map.on("locationfound", onFound);
    map.on("locationerror", onErr);
    return () => {
      map.off("locationfound", onFound);
      map.off("locationerror", onErr);
    };
  }, [map]);
  return null;
}

export default function LiveRoadMap({ searchQuery, searchResults, searched }) {
  const mapRef = useRef(null);
  const sectionRef = useRef(null);
  const [satellite, setSatellite] = useState(false);

  const { reports } = useReports(); // ← changed

  const icon = useMemo(
    () => L.divIcon({
      className: "",
      html: '<div class="marker-dot"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    }), []
  );

  const points = useMemo(() => {
  if (searched && searchResults?.length >= 0) return searchResults;
  return filterPoints(searchQuery, reports);
  }, [searchQuery, reports, searched, searchResults]);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const toggleLayer = () => setSatellite((s) => !s);
  const fullscreen = () => {
    const el = sectionRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  };
  const locate = () => mapRef.current?.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });

  return (
    <section className="map-section card-elevated" id="map-section" ref={sectionRef} aria-labelledby="mapHeading">
      <div className="map-section-head">
        <div>
          <h2 id="mapHeading" className="section-title">Live Road Damage Map</h2>
          <p className="section-sub">Pothole markers across major Lahore corridors — zoom and explore.</p>
        </div>
        <div className="map-toolbar" role="toolbar" aria-label="Map controls">
          <button type="button" className="tool-btn" onClick={zoomIn} title="Zoom in">+</button>
          <button type="button" className="tool-btn" onClick={zoomOut} title="Zoom out">−</button>
          <button type="button" className="tool-btn" onClick={toggleLayer} title="Switch map layer">Layers</button>
          <button type="button" className="tool-btn" onClick={fullscreen} title="Fullscreen">⛶</button>
          <button type="button" className="tool-btn tool-btn-accent" onClick={locate} title="Current location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>
      <MapContainer
        className="leaflet-map"
        center={[31.52, 74.35]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom
      >
        <MapBridge mapRef={mapRef} />
        <MapResize />
        <FlyToSearch searchQuery={searchQuery} reports={reports} />
        <LocateListener />
        {satellite ? (
          <TileLayer attribution="Tiles &copy; Esri" url={ESRI} maxZoom={19} />
        ) : (
          <TileLayer attribution="&copy; OpenStreetMap" url={OSM} maxZoom={19} />
        )}
        {/* ← changed: key, position, popup use live DB fields */}
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
            <Popup className="pothole-popup">
              <strong>{p.location_text || "Unknown area"}</strong>
              <br />
              Severity: {p.severity} · {(p.confidence * 100).toFixed(0)}% confidence
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}