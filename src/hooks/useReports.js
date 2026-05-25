import { useState, useEffect } from "react";
 
export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    let cancelled = false;
 
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setReports(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
 
    fetchReports();
    return () => { cancelled = true; };
  }, []);
 
  return { reports, loading, error };
}