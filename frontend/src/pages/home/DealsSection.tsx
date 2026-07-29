import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Skeleton } from 'antd';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { useAuth } from '@features/auth';
import { useFavorites } from '@features/favorites';

export function DealsSection() {
  const { t } = useTranslation();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    hotelApi.getAllPaged({ pageSize: 6, sortBy: 'price' })
      .then(({ items }) => setHotels(items))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active />;
  if (hotels.length === 0) return null;

  return (
    <section style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('home.greatDeals')}</Typography.Title>
      <div style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 8,
      }}>
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
