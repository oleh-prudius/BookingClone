import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Skeleton } from 'antd';
import { hotelApi } from '@entities/hotel';
import type { Hotel } from '@shared/types';

interface Destination {
  cityName: string;
  countryName: string;
  photoUrl: string | null;
  hotelCount: number;
}

function buildDestinations(hotels: Hotel[]): Destination[] {
  const byCity = new Map<string, Destination>();
  for (const h of hotels) {
    const existing = byCity.get(h.cityName);
    if (existing) {
      existing.hotelCount += 1;
      existing.photoUrl ??= h.coverPhotoUrl ?? null;
    } else {
      byCity.set(h.cityName, {
        cityName: h.cityName,
        countryName: h.countryName,
        photoUrl: h.coverPhotoUrl ?? null,
        hotelCount: 1,
      });
    }
  }
  return [...byCity.values()].sort((a, b) => b.hotelCount - a.hotelCount).slice(0, 8);
}

export function PopularDestinations() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelApi.getAllPaged({ pageSize: 50 })
      .then(({ items }) => setDestinations(buildDestinations(items)))
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active />;
  if (destinations.length === 0) return null;

  return (
    <section style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('home.popularDestinations')}</Typography.Title>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {destinations.map((d) => (
          <div
            key={d.cityName}
            role="button"
            tabIndex={0}
            aria-label={t('home.searchHotelsIn', { city: d.cityName })}
            onClick={() => navigate(`/hotels?destination=${encodeURIComponent(d.cityName)}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/hotels?destination=${encodeURIComponent(d.cityName)}`);
              }
            }}
            style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', position: 'relative' }}
          >
            <img
              src={d.photoUrl ?? 'https://placehold.co/300x200?text=No+Photo'}
              alt={d.cityName}
              style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: 12,
              color: 'white',
            }}>
              <div style={{ fontWeight: 600 }}>{d.cityName}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{t('home.hotelCount', { count: d.hotelCount })}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
