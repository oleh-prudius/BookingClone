import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { App, Typography, Tabs, List, Tag, Skeleton, Empty, Modal, Descriptions } from 'antd';
import { useAuth } from '@features/auth';
import { bookingApi } from '@entities/booking';
import { hotelApi } from '@entities/hotel';
import { AppButton } from '@shared/ui';
import type { Booking, BookingStatus } from '@shared/types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  Pending: 'gold',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

const CANCELLABLE_STATUSES: BookingStatus[] = ['Pending', 'Confirmed'];

type BookingTab = 'upcoming' | 'past' | 'cancelled';

function categorize(booking: Booking): BookingTab {
  if (booking.status === 'Cancelled') return 'cancelled';
  return dayjs(booking.checkOut).isBefore(dayjs()) ? 'past' : 'upcoming';
}

export function MyBookingsPage() {
  const { isAuthenticated } = useAuth();
  const { modal, message } = App.useApp();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotelNames, setHotelNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<BookingTab>('upcoming');
  const [selected, setSelected] = useState<Booking | null>(null);

  const loadBookings = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleCancel = (booking: Booking) => {
    modal.confirm({
      title: 'Cancel this booking?',
      content: `${hotelNames[booking.hotelId] ?? `Hotel #${booking.hotelId}`}, ${new Date(booking.checkIn).toLocaleDateString()} – ${new Date(booking.checkOut).toLocaleDateString()}`,
      okText: 'Cancel booking',
      okButtonProps: { danger: true },
      cancelText: 'Keep it',
      onOk: () =>
        bookingApi.changeStatus(booking.id, 'Cancelled')
          .then(() => {
            message.success('Booking cancelled');
            setSelected(null);
            loadBookings();
          })
          .catch(() => message.error('Failed to cancel booking')),
    });
  };

  const grouped: Record<BookingTab, Booking[]> = { upcoming: [], past: [], cancelled: [] };
  for (const booking of bookings) grouped[categorize(booking)].push(booking);

  const renderList = (items: Booking[]) => {
    if (loading) return <Skeleton active />;
    if (items.length === 0) return <Empty description="No bookings here" />;

    return (
      <List
        dataSource={items}
        renderItem={(b) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => setSelected(b)}
            actions={CANCELLABLE_STATUSES.includes(b.status) ? [
              <AppButton
                key="cancel"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); handleCancel(b); }}
              >
                Cancel
              </AppButton>,
            ] : undefined}
          >
            <List.Item.Meta
              title={hotelNames[b.hotelId] ?? `Hotel #${b.hotelId}`}
              description={`${new Date(b.checkIn).toLocaleDateString()} – ${new Date(b.checkOut).toLocaleDateString()} · ${b.guests} guest${b.guests === 1 ? '' : 's'}`}
            />
            <div style={{ textAlign: 'right' }}>
              <Typography.Text strong>${b.totalPrice}</Typography.Text>
              <div>
                <Tag color={STATUS_COLORS[b.status]}>{b.status}</Tag>
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <section style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3}>My Bookings</Typography.Title>

      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as BookingTab)}
        items={[
          { key: 'upcoming', label: `Upcoming (${grouped.upcoming.length})`, children: renderList(grouped.upcoming) },
          { key: 'past', label: `Past (${grouped.past.length})`, children: renderList(grouped.past) },
          { key: 'cancelled', label: `Cancelled (${grouped.cancelled.length})`, children: renderList(grouped.cancelled) },
        ]}
      />

      <Modal
        open={selected !== null}
        onCancel={() => setSelected(null)}
        footer={selected && CANCELLABLE_STATUSES.includes(selected.status) ? [
          <AppButton key="cancel" variant="secondary" onClick={() => handleCancel(selected)}>
            Cancel booking
          </AppButton>,
        ] : null}
        title="Booking details"
      >
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Hotel">{hotelNames[selected.hotelId] ?? `Hotel #${selected.hotelId}`}</Descriptions.Item>
            <Descriptions.Item label="Check-in">{new Date(selected.checkIn).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Check-out">{new Date(selected.checkOut).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Guests">{selected.guests}</Descriptions.Item>
            <Descriptions.Item label="Total price">${selected.totalPrice}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_COLORS[selected.status]}>{selected.status}</Tag>
            </Descriptions.Item>
            {selected.confirmedAtUtc && (
              <Descriptions.Item label="Confirmed at">{new Date(selected.confirmedAtUtc).toLocaleString()}</Descriptions.Item>
            )}
            {selected.cancelledAtUtc && (
              <Descriptions.Item label="Cancelled at">{new Date(selected.cancelledAtUtc).toLocaleString()}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </section>
  );
}
