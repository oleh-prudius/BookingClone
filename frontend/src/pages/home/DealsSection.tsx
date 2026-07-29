import { useEffect, useState } from 'react';
import { Typography, Skeleton } from 'antd';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';

export function DealsSection() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

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
      <Typography.Title level={3}>Great deals</Typography.Title>
      <div style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {hotels.map((h) => (
          <div key={h.id} style={{ minWidth: 280, maxWidth: 280, flexShrink: 0 }}>
            <HotelCard hotel={h} variant="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}
