import { Card, Rate, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined } from '@ant-design/icons';
import type { Hotel } from '@shared/types';
import { AppButton } from '@shared/ui';
import { toStars } from '@shared/lib/rating';

interface Props {
  hotel: Hotel;
  variant?: 'grid' | 'list';
}

export function HotelCard({ hotel, variant = 'grid' }: Props) {
  const navigate = useNavigate();

  const ratingBlock = hotel.rating != null
    ? <Rate disabled allowHalf defaultValue={toStars(hotel.rating)} style={{ fontSize: 14 }} />
    : <Tag>No reviews yet</Tag>;

  const priceBlock = hotel.pricePerNight != null && (
    <span style={{ fontWeight: 600, color: 'var(--triply-primary)' }}>
      from ${hotel.pricePerNight}/night
    </span>
  );

  if (variant === 'list') {
    return (
      <Card hoverable style={{ width: '100%' }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <img
            src={hotel.coverPhotoUrl ?? 'https://placehold.co/400x200?text=No+Photo'}
            alt={hotel.name}
            style={{ width: 240, minWidth: 200, height: 180, objectFit: 'cover', flexShrink: 0 }}
          />

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
            width: 200,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderLeft: '1px solid var(--border)',
          }}>
            {priceBlock}
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
      cover={
        <img
          src={hotel.coverPhotoUrl ?? 'https://placehold.co/400x200?text=No+Photo'}
          alt={hotel.name}
          style={{ height: 200, objectFit: 'cover' }}
        />
      }
      style={{ width: '100%' }}
    >
      <Card.Meta
        title={hotel.name}
        description={
          <span>
            <EnvironmentOutlined /> {hotel.cityName}, {hotel.countryName}
          </span>
        }
      />

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {ratingBlock}
        {priceBlock}
      </div>

      <div style={{ marginTop: 12 }}>
        <AppButton variant="primary" onClick={() => navigate(`/hotels/${hotel.id}`)}>
          Details
        </AppButton>
      </div>
    </Card>
  );
}
