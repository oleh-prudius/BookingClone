import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Row, Col, Empty, Skeleton } from 'antd';
import { useAuth } from '@features/auth';
import { useFavorites } from '@features/favorites';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';

export function FavoritesPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favoriteIds.size === 0) {
      setHotels([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([...favoriteIds].map((id) => hotelApi.getById(id).catch(() => null)))
      .then((results) => setHotels(results.filter((h): h is Hotel => h !== null)))
      .finally(() => setLoading(false));
  }, [favoriteIds]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <section style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('favorites.title')}</Typography.Title>

      {loading
        ? <Skeleton active />
        : hotels.length === 0
          ? <Empty description={t('favorites.noFavoritesYet')} />
          : (
            <Row gutter={[16, 16]}>
              {hotels.map((h) => (
                <Col key={h.id} xs={24} sm={12} lg={8}>
                  <HotelCard
                    hotel={h}
                    variant="grid"
                    isFavorite={isFavorite(h.id)}
                    onToggleFavorite={() => toggleFavorite(h.id)}
                  />
                </Col>
              ))}
            </Row>
          )}
    </section>
  );
}
