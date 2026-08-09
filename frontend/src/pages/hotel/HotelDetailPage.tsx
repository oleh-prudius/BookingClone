import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Rate, Tag, Carousel, Skeleton, Result, Empty, Divider } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled, StarFilled } from '@ant-design/icons';
import { hotelApi } from '@entities/hotel';
import { hotelPhotoApi, type HotelPhoto } from '@entities/hotel-photo';
import { MapPanel } from '@widgets/hotel-map';
import { NearbyPlacesList } from '@widgets/nearby-places';
import type { Hotel } from '@shared/types';
import { AppButton } from '@shared/ui';
import { toStars } from '@shared/lib/rating';
import { formatPrice } from '@shared/lib/currency';
import { useCurrency } from '@shared/theme/CurrencyContext';
import { useAuth } from '@features/auth';
import { useFavorites } from '@features/favorites';
import { ReviewsSection } from './ReviewsSection';

export function HotelDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hotelId = Number(id);
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { currency } = useCurrency();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [photos, setPhotos] = useState<HotelPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const reloadHotel = () => {
    hotelApi.getById(hotelId)
      .then((h) => setHotel(h))
      .catch(() => setNotFound(true));
  };

  useEffect(() => {
    if (!Number.isFinite(hotelId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    hotelApi.getById(hotelId)
      .then((h) => setHotel(h))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    hotelPhotoApi.getByHotelId(hotelId)
      .then((p) => setPhotos(p.sort((a, b) => a.priority - b.priority)))
      .catch(() => setPhotos([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  if (loading) {
    return (
      <section style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <Skeleton.Image active style={{ width: '100%', height: 360 }} />
        <Skeleton active style={{ marginTop: 24 }} />
      </section>
    );
  }

  if (notFound || !hotel) {
    return (
      <Result
        status="404"
        title={t('hotel.notFoundTitle')}
        subTitle={t('hotel.notFoundSubtitle')}
        extra={<AppButton variant="primary" onClick={() => navigate('/hotels')}>{t('hotel.backToSearch')}</AppButton>}
      />
    );
  }

  const galleryImages = photos.length > 0
    ? photos.map((p) => p.name)
    : [hotel.coverPhotoUrl ?? 'https://placehold.co/1000x400?text=No+Photo'];

  return (
    <section style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Carousel arrows infinite={galleryImages.length > 1} style={{ borderRadius: 8, overflow: 'hidden' }}>
        {galleryImages.map((src, i) => (
          <div key={i}>
            <img src={src} alt={`${hotel.name} photo ${i + 1}`} style={{ width: '100%', height: 360, objectFit: 'cover' }} />
          </div>
        ))}
      </Carousel>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Title level={2} style={{ margin: 0 }}>{hotel.name}</Typography.Title>
            {hotel.starRating > 0 && (
              <span aria-label={t('hotels.starHotel', { count: hotel.starRating })} style={{ color: '#faad14', fontSize: 16 }}>
                {Array.from({ length: hotel.starRating }, (_, i) => <StarFilled key={i} />)}
              </span>
            )}
          </div>
          <Typography.Text type="secondary">
            <EnvironmentOutlined /> {hotel.street}, {hotel.cityName}, {hotel.countryName}
          </Typography.Text>
          <div style={{ marginTop: 8 }}>
            {hotel.rating != null
              ? <Rate disabled allowHalf defaultValue={toStars(hotel.rating)} />
              : <Tag>{t('hotels.noReviewsYet')}</Tag>}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          {hotel.pricePerNight != null && (
            <Typography.Title level={3} style={{ margin: 0, color: 'var(--triply-textAccent)' }}>
              {formatPrice(hotel.pricePerNight, currency)}<Typography.Text type="secondary" style={{ fontSize: 14 }}>{t('hotel.perNight')}</Typography.Text>
            </Typography.Title>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            {isAuthenticated && (
              <AppButton
                variant="secondary"
                icon={isFavorite(hotel.id) ? <HeartFilled style={{ color: '#e0245e' }} /> : <HeartOutlined />}
                onClick={() => toggleFavorite(hotel.id)}
              >
                {isFavorite(hotel.id) ? t('hotel.saved') : t('hotel.save')}
              </AppButton>
            )}
            <AppButton variant="primary" onClick={() => navigate(`/hotels/${hotel.id}/book`)}>
              {t('hotel.book')}
            </AppButton>
          </div>
        </div>
      </div>

      <Divider />

      <Typography.Title level={4}>{t('hotel.aboutThisHotel')}</Typography.Title>
      <Typography.Paragraph>{hotel.description}</Typography.Paragraph>

      <Typography.Title level={4}>{t('hotel.amenities')}</Typography.Title>
      {hotel.amenities && hotel.amenities.length > 0
        ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {hotel.amenities.map((a) => <Tag key={a}>{a}</Tag>)}
          </div>
        )
        : <Empty description={t('hotel.noAmenitiesListed')} style={{ margin: '16px 0' }} />}

      <Typography.Title level={4}>{t('hotel.location')}</Typography.Title>
      <div style={{ marginBottom: 24 }}>
        <MapPanel hotels={[hotel]} height="360px" sticky={false} />
      </div>

      <Typography.Title level={4}>{t('header.nearby')}</Typography.Title>
      <div style={{ marginBottom: 24 }}>
        <NearbyPlacesList hotelId={hotel.id} />
      </div>

      <Typography.Title level={4}>{t('hotel.reviews')}</Typography.Title>
      <ReviewsSection hotelId={hotel.id} onReviewSubmitted={reloadHotel} />
    </section>
  );
}
