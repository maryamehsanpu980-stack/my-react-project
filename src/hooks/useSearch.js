import { useState, useCallback } from "react";

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (query, radius = 500) => {
    if (!query) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(false);

      const isCoords = typeof query === 'object' && query.lat && query.lng;
      const params = isCoords
        ? new URLSearchParams({ lat: query.lat, lng: query.lng, radius })
        : new URLSearchParams({ area: query });

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setSearched(false);
    setError(null);
  }, []);

  return { results, loading, error, searched, search, clear };
}