import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { SEARCHABLE_AREAS } from "../data/siteData.js";

const OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function mergePinIntoLocation(prev, lat, lng) {
  const pin = `(map: ${lat.toFixed(5)}, ${lng.toFixed(5)})`;
  const base = prev.replace(/\s*\(map:[^)]+\)\s*$/i, "").trim();
  return base ? `${base} ${pin}` : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function ModalMapEvents({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ModalMapResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function ModalMapPick({ onPinChange }) {
  const [position, setPosition] = useState([31.52, 74.35]);
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: '<div class="marker-dot"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    []
  );

  const handlePick = useCallback(
    (lat, lng) => {
      setPosition([lat, lng]);
      onPinChange(lat, lng);
    },
    [onPinChange]
  );

  return (
    <MapContainer className="modal-map-inner" center={[31.52, 74.35]} zoom={13} scrollWheelZoom>
      <ModalMapResize />
      <ModalMapEvents onPick={handlePick} />
      <TileLayer attribution="&copy; OpenStreetMap" url={OSM} maxZoom={19} />
      <Marker
        position={position}
        icon={icon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const ll = e.target.getLatLng();
            handlePick(ll.lat, ll.lng);
          },
        }}
      />
    </MapContainer>
  );
}

export default function ReportModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pinLat, setPinLat] = useState(31.52);
  const [pinLng, setPinLng] = useState(74.35);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handlePinChange = useCallback((lat, lng) => {
    setLocation((prev) => mergePinIntoLocation(prev, lat, lng));
    setPinLat(lat);
    setPinLng(lng);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setLocation("");
      setPinLat(31.52);
      setPinLng(74.35);
      setSubmitError(null);
      setSubmitSuccess(null);
      setSubmitting(false);
      setPreviewUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
      setDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const showPreview = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setSubmitError("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("lat", pinLat);
    formData.append("lng", pinLng);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("location", location);

    setSubmitting(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        if (data.status === "approved") {
          setSubmitSuccess("Your report is live on the map!");
          setTimeout(() => onClose(), 2000);
        } else if (data.status === "duplicate") {
          setSubmitSuccess("A report already exists nearby — thanks for confirming!");
          setTimeout(() => onClose(), 2500);
        } else {
          setSubmitSuccess(data.message || "Submitted successfully.");
          setTimeout(() => onClose(), 2000);
        }
      } else {
        setSubmitError(data.message || "Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={onBackdropClick}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="modalTitle">Add New Report</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="modal-body" onSubmit={onSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                required
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="form-field form-field-full">
              <span>Location</span>
              <div className="location-row">
                <input
                  type="text"
                  name="location"
                  id="modalLocation"
                  required
                  placeholder="e.g. Gulberg III, MM Alam Road"
                  list="lahoreAreasModal"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <datalist id="lahoreAreasModal">
                  {SEARCHABLE_AREAS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
              <p className="field-hint">Type a Lahore area or tap the map to drop a pin.</p>
              <div id="modalMap" className="modal-map modal-leaflet" aria-label="Pick location on map">
                <ModalMapPick onPinChange={handlePinChange} />
              </div>
            </div>
            <div className="form-field form-field-full">
              <span>Pothole picture upload</span>
              <div
                className={`dropzone${dragOver ? " dragover" : ""}`}
                tabIndex={0}
                role="button"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer?.files?.[0];
                  showPreview(f);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  hidden
                  onChange={() => {
                    const f = fileInputRef.current?.files?.[0];
                    showPreview(f);
                  }}
                />
                {!previewUrl ? (
                  <div className="dropzone-inner">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="dropzone-meta">PNG, JPG up to 5MB</p>
                  </div>
                ) : (
                  <div className="dropzone-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {submitError && (
            <p style={{ color: "#dc2626", margin: "8px 0 0", fontSize: "0.88rem" }}>
              ⚠ {submitError}
            </p>
          )}
          {submitSuccess && (
            <p style={{ color: "#0d9488", margin: "8px 0 0", fontSize: "0.88rem" }}>
              ✓ {submitSuccess}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}