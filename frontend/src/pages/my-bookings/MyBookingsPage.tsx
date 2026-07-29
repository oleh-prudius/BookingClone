import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const statusLabels: Record<BookingStatus, string> = {
    Pending: t('myBookings.status.pending'),
    Confirmed: t('myBookings.status.confirmed'),
    Completed: t('myBookings.status.completed'),
    Cancelled: t('myBookings.status.cancelled'),
  };

  const handleCancel = (booking: Booking) => {
    modal.confirm({
      title: t('myBookings.cancelConfirmTitle'),
      content: `${hotelNames[booking.hotelId] ?? t('myBookings.hotelFallback', { id: booking.hotelId })}, ${new Date(booking.checkIn).toLocaleDateString()} – ${new Date(booking.checkOut).toLocaleDateString()}`,
      okText: t('myBookings.cancelBooking'),
      okButtonProps: { danger: true },
      cancelText: t('myBookings.keepIt'),
      onOk: () =>
        bookingApi.changeStatus(booking.id, 'Cancelled')
          .then(() => {
            message.success(t('myBookings.bookingCancelled'));
            setSelected(null);
            loadBookings();
          })
          .catch(() => message.error(t('myBookings.cancelFailed'))),
    });
  };

  const grouped: Record<BookingTab, Booking[]> = { upcoming: [], past: [], cancelled: [] };
  for (const booking of bookings) grouped[categorize(booking)].push(booking);

  const renderList = (items: Booking[]) => {
    if (loading) return <Skeleton active />;
    if (items.length === 0) return <Empty description={t('myBookings.noBookingsHere')} />;

    return (
      <List
        dataSource={items}
        renderItem={(b) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label={t('myBookings.viewDetailsFor', { hotelName: hotelNames[b.hotelId] ?? t('myBookings.hotelFallbackLower', { id: b.hotelId }) })}
            onClick={() => setSelected(b)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(b);
              }
            }}
            actions={CANCELLABLE_STATUSES.includes(b.status) ? [
              <AppButton
                key="cancel"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); handleCancel(b); }}
              >
                {t('common.cancel')}
              </AppButton>,
            ] : undefined}
          >
            <List.Item.Meta
              title={hotelNames[b.hotelId] ?? t('myBookings.hotelFallback', { id: b.hotelId })}
              description={`${new Date(b.checkIn).toLocaleDateString()} – ${new Date(b.checkOut).toLocaleDateString()} · ${t('myBookings.guestsCount', { count: b.guests })}`}
            />
            <div style={{ textAlign: 'right' }}>
              <Typography.Text strong>${b.totalPrice}</Typography.Text>
              <div>
                <Tag color={STATUS_COLORS[b.status]}>{statusLabels[b.status]}</Tag>
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <section style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('myBookings.title')}</Typography.Title>

      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as BookingTab)}
        items={[
          { key: 'upcoming', label: t('myBookings.tabUpcoming', { count: grouped.upcoming.length }), children: renderList(grouped.upcoming) },
          { key: 'past', label: t('myBookings.tabPast', { count: grouped.past.length }), children: renderList(grouped.past) },
          { key: 'cancelled', label: t('myBookings.tabCancelled', { count: grouped.cancelled.length }), children: renderList(grouped.cancelled) },
        ]}
      />

      <Modal
        open={selected !== null}
        onCancel={() => setSelected(null)}
        footer={selected && CANCELLABLE_STATUSES.includes(selected.status) ? [
          <AppButton key="cancel" variant="secondary" onClick={() => handleCancel(selected)}>
            {t('myBookings.cancelBooking')}
          </AppButton>,
        ] : null}
        title={t('myBookings.bookingDetails')}
      >
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('myBookings.hotel')}>{hotelNames[selected.hotelId] ?? t('myBookings.hotelFallback', { id: selected.hotelId })}</Descriptions.Item>
            <Descriptions.Item label={t('search.checkIn')}>{new Date(selected.checkIn).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label={t('search.checkOut')}>{new Date(selected.checkOut).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label={t('booking.guests')}>{selected.guests}</Descriptions.Item>
            <Descriptions.Item label={t('myBookings.totalPrice')}>${selected.totalPrice}</Descriptions.Item>
            <Descriptions.Item label={t('myBookings.statusLabel')}>
              <Tag color={STATUS_COLORS[selected.status]}>{statusLabels[selected.status]}</Tag>
            </Descriptions.Item>
            {selected.confirmedAtUtc && (
              <Descriptions.Item label={t('myBookings.confirmedAt')}>{new Date(selected.confirmedAtUtc).toLocaleString()}</Descriptions.Item>
            )}
            {selected.cancelledAtUtc && (
              <Descriptions.Item label={t('myBookings.cancelledAt')}>{new Date(selected.cancelledAtUtc).toLocaleString()}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </section>
  );
}
