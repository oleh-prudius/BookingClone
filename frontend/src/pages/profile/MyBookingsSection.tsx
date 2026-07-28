import { useEffect, useState } from 'react';
import { List, Tag, Skeleton, Empty, Typography } from 'antd';
import { bookingApi } from '@entities/booking';
import { hotelApi } from '@entities/hotel';
import type { Booking } from '@shared/types';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'gold',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

export function MyBookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotelNames, setHotelNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getAll()
      .then(async ({ items }) => {
        setBookings(items);
        const uniqueHotelIds = [...new Set(items.map((b) => b.hotelId))];
        const entries = await Promise.all(
          uniqueHotelIds.map((id) => hotelApi.getById(id).then((h) => [id, h.name] as const).catch(() => [id, `Hotel #${id}`] as const)),
        );
        setHotelNames(Object.fromEntries(entries));
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active />;
  if (bookings.length === 0) return <Empty description="No bookings yet" />;

  return (
    <List
      dataSource={bookings}
      renderItem={(b) => (
        <List.Item>
          <List.Item.Meta
            title={hotelNames[b.hotelId] ?? `Hotel #${b.hotelId}`}
            description={`${new Date(b.checkIn).toLocaleDateString()} – ${new Date(b.checkOut).toLocaleDateString()} · ${b.guests} guest${b.guests === 1 ? '' : 's'}`}
          />
          <div style={{ textAlign: 'right' }}>
            <Typography.Text strong>${b.totalPrice}</Typography.Text>
            <div>
              <Tag color={STATUS_COLORS[b.status] ?? 'default'}>{b.status}</Tag>
            </div>
          </div>
        </List.Item>
      )}
    />
  );
}
