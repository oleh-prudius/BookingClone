import { Card, Rate, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import type { Hotel } from '@shared/types';
import { AppButton } from '@shared/ui';
import { toStars } from '@shared/lib/rating';

interface Props {
  hotel: Hotel;
  variant?: 'grid' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function HotelCard({ hotel, variant = 'grid', isFavorite, onToggleFavorite }: Props) {
  const navigate = useNavigate();

  const ratingBlock = hotel.rating != null
    ? <Rate disabled allowHalf defaultValue={toStars(hotel.rating)} style={{ fontSize: 14 }} />
    : <Tag>No reviews yet</Tag>;

  const priceStack = hotel.pricePerNight != null && (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        Price for 1 night
      </Typography.Text>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--triply-primary)', lineHeight: 1.2 }}>
        ${hotel.pricePerNight}
      </div>
    </div>
  );

  const favoriteButton = onToggleFavorite && (
    <button
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      style={{
        border: 'none',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '50%',
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 16,
        color: isFavorite ? '#e0245e' : '#666',
      }}
    >
      {isFavorite ? <HeartFilled /> : <HeartOutlined />}
    </button>
  );

  if (variant === 'list') {
    return (
      <Card hoverable style={{ width: '100%' }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={hotel.coverPhotoUrl ?? 'https://placehold.co/400x200?text=No+Photo'}
              alt={hotel.name}
              style={{ width: 240, minWidth: 200, height: 180, objectFit: 'cover', display: 'block' }}
            />
            {favoriteButton && (
              <div style={{ position: 'absolute', top: 8, right: 8 }}>{favoriteButton}</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 220, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{hotel.name}</div>
              <div style={{ color: 'var(--text)', marginTop: 4 }}>
                <EnvironmentOutlined /> {hotel.cityName}, {hotel.countryName}
              </div>
              <div style={{ marginTop: 8 }}>{ratingBlock}</div>
            </div>
          </div>

          <div style={{
            width: 180,
            minWidth: 160,
            flexShrink: 0,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            textAlign: 'right',
            borderLeft: '1px solid var(--border)',
          }}>
            {priceStack}
            <AppButton variant="primary" onClick={() => navigate(`/hotels/${hotel.id}`)}>
              Details
            </AppButton>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverable
      style={{ width: '100%' }}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            src={hotel.coverPhotoUrl ?? 'https://placehold.co/400x200?text=No+Photo'}
            alt={hotel.name}
            style={{ height: 200, objectFit: 'cover', width: '100%', display: 'block' }}
          />
          {favoriteButton && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>{favoriteButton}</div>
          )}
        </div>
      }
    >
      <Card.Meta
        title={hotel.name}
        description={
          <span>
            <EnvironmentOutlined /> {hotel.cityName}, {hotel.countryName}
          </span>
        }
      />

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {ratingBlock}
        {priceStack}
      </div>

      <div style={{ marginTop: 12 }}>
        <AppButton variant="primary" onClick={() => navigate(`/hotels/${hotel.id}`)}>
          Details
        </AppButton>
      </div>
    </Card>
  );
}
