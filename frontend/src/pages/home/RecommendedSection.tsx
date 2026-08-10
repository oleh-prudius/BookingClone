import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { useAuth } from '@features/auth';
import { useFavorites } from '@features/favorites';
import { useGeoLocation } from '@shared/lib/useGeoLocation';
import { localizeCityName, localizeCountryName } from '@shared/lib/geoNames';

export function RecommendedSection() {
  const { t, i18n } = useTranslation();
  const { location, loading: locLoading } = useGeoLocation();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [matchedBy, setMatchedBy] = useState<'city' | 'country' | null>(null);
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (locLoading) return;
    if (!location?.city && !location?.country) return;

    let cancelled = false;

    (async () => {
      try {
        if (location.city) {
          const byCity = await hotelApi.getAllPaged({ pageSize: 6, city: location.city });
          if (cancelled) return;
          if (byCity.items.length > 0) {
            setHotels(byCity.items);
            setMatchedBy('city');
            return;
          }
        }
        if (location.country) {
          const byCountry = await hotelApi.getAllPaged({ pageSize: 6, country: location.country });
          if (cancelled) return;
          if (byCountry.items.length > 0) {
            setHotels(byCountry.items);
            setMatchedBy('country');
          }
        }
      } catch {
        // Silently skip the section — this is a nice-to-have recommendation, not core functionality.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locLoading, location]);

  if (hotels.length === 0 || !matchedBy) return null;

  const title = matchedBy === 'city'
    ? t('home.recommendedInCity', { city: localizeCityName(location!.city!, i18n.language) })
    : t('home.recommendedInCountry', { country: localizeCountryName(location!.country!, i18n.language) });

  return (
    <section style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography.Title level={3}>{title}</Typography.Title>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {hotels.map((h) => (
          <div key={h.id} style={{ minWidth: 280, maxWidth: 280, flexShrink: 0 }}>
            <HotelCard
              hotel={h}
              variant="grid"
              isFavorite={isFavorite(h.id)}
              onToggleFavorite={isAuthenticated ? () => toggleFavorite(h.id) : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
