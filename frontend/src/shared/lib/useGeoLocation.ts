import { useEffect, useState } from 'react';

export interface GeoLocation {
  city: string | null;
  country: string | null;
}

// IP-based geolocation (no permission prompt, unlike navigator.geolocation).
// Free, keyless endpoint — good enough for a "recommended near you" hint, not for anything precise.
export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data: { city?: string; country_name?: string }) => {
        if (cancelled) return;
        setLocation({ city: data.city ?? null, country: data.country_name ?? null });
      })
      .catch(() => {
        if (!cancelled) setLocation(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, loading };
}
