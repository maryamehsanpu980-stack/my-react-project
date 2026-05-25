import { useState, useCallback } from "react";

const LAHORE_BOUNDS = {
  latMin: 31.35, latMax: 31.70,
  lngMin: 74.15, lngMax: 74.55,
};

function isWithinLahore(lat, lng) {
  return (
    lat >= LAHORE_BOUNDS.latMin && lat <= LAHORE_BOUNDS.latMax &&
    lng >= LAHORE_BOUNDS.lngMin && lng <= LAHORE_BOUNDS.lngMax
  );
}

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!isWithinLahore(lat, lng)) {
          setError("Your location is outside Lahore. Zoom manually on the map.");
          setLoading(false);
          return;
        }

        setPosition({ lat, lng });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case 1:
            setError("Location permission denied.");
            break;
          case 2:
            setError("Location unavailable. Try zooming manually.");
            break;
          case 3:
            setError("Location request timed out.");
            break;
          default:
            setError("Could not get your location.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const clear = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  return { position, loading, error, locate, clear };
}