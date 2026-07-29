import { Card, Rate, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined } from '@ant-design/icons';
import type { Hotel } from '@shared/types';
import { AppButton } from '@shared/ui';
import { toStars } from '@shared/lib/rating';

interface Props {
  hotel: Hotel;
}

export function HotelCard({ hotel }: Props) {
  const navigate = useNavigate();

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
        {hotel.rating != null
          ? <Rate disabled allowHalf defaultValue={toStars(hotel.rating)} style={{ fontSize: 14 }} />
          : <Tag>No reviews yet</Tag>
        }
        {hotel.pricePerNight != null && (
          <span style={{ fontWeight: 600, color: 'var(--triply-primary)' }}>
            from ${hotel.pricePerNight}/night
          </span>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <AppButton variant="primary" onClick={() => navigate(`/hotels/${hotel.id}`)}>
          Details
        </AppButton>
      </div>
    </Card>
  );
}
