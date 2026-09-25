import { useCallback, useEffect, useState } from "react";
import api from "../services/axios";

const CACHE_TTL_MS = 60000;

let statsPromise = null;
let cachedStats = null;
let cachedAt = 0;

const loadStats = () => {
  if (cachedStats && Date.now() - cachedAt < CACHE_TTL_MS) {
    return Promise.resolve(cachedStats);
  }

  if (!statsPromise) {
    statsPromise = api
      .get("/public/stats")
      .then((response) => {
        const stats = response.data?.data?.stats || null;
        if (stats) {
          cachedStats = stats;
          cachedAt = Date.now();
        }
        return stats;
      })
      .finally(() => {
        statsPromise = null;
      });
  }

  return statsPromise;
};

export const formatStatNumber = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US").format(value)
    : "—";

const usePublicStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadStats()
      .then((data) => {
        if (!isMounted) return;
        setStats(data);
        setError(!data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setStats(null);
        setError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatStat = useCallback(
    (key) => (loading || !stats || stats[key] == null ? "—" : formatStatNumber(stats[key])),
    [loading, stats]
  );

  return { stats, loading, error, formatStat };
};

export default usePublicStats;
