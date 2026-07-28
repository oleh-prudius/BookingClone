import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { Typography, Radio, DatePicker, InputNumber, Input, Alert, Skeleton, Result, Divider, Card } from 'antd';
import { useAuth } from '@features/auth';
import { hotelApi } from '@entities/hotel';
import { roomApi, type Room } from '@entities/room';
import { roomVariantApi, type RoomVariant } from '@entities/room-variant';
import { bookingApi } from '@entities/booking';
import type { Hotel } from '@shared/types';
import { AppButton } from '@shared/ui';

interface BookableVariant {
  variant: RoomVariant;
  roomName: string;
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [options, setOptions] = useState<BookableVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [variantId, setVariantId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [guests, setGuests] = useState(1);
  const [personalWishes, setPersonalWishes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(hotelId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      hotelApi.getById(hotelId),
      roomApi.getByHotelId(hotelId),
    ])
      .then(async ([h, rooms]: [Hotel, Room[]]) => {
        setHotel(h);
        const perRoom = await Promise.all(
          rooms.map((room) => roomVariantApi.getByRoomId(room.id).then((variants) =>
            variants.map((variant) => ({ variant, roomName: room.name })))),
        );
        const flat = perRoom.flat();
        setOptions(flat);
        if (flat.length > 0) setVariantId(flat[0].variant.id);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hotelId]);

  const selected = options.find((o) => o.variant.id === variantId) ?? null;
  const maxGuests = selected ? selected.variant.adultCount + selected.variant.childCount : 1;

  const nights = useMemo(() => {
    if (!dateRange) return 0;
    const diff = dateRange[1].startOf('day').diff(dateRange[0].startOf('day'), 'day');
    return Math.max(diff, 0);
  }, [dateRange]);

  const pricePerNight = selected ? selected.variant.discountPrice ?? selected.variant.price : 0;
  const total = pricePerNight * nights;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <section style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
        <Skeleton active />
      </section>
    );
  }

  if (notFound || !hotel) {
    return (
      <Result
        status="404"
        title="Hotel not found"
        extra={<AppButton variant="primary" onClick={() => navigate('/hotels')}>Back to search</AppButton>}
      />
    );
  }

  if (success) {
    return (
      <Result
        status="success"
        title="Booking created"
        subTitle={`Your stay at ${hotel.name} has been requested and is pending confirmation.`}
        extra={<AppButton variant="primary" onClick={() => navigate('/profile')}>View my bookings</AppButton>}
      />
    );
  }

  const handleSubmit = () => {
    setFormError(null);

    if (!selected) {
      setFormError('Please select a room.');
      return;
    }
    if (!dateRange) {
      setFormError('Please select check-in and check-out dates.');
      return;
    }
    if (dateRange[0].startOf('day').isBefore(dayjs().startOf('day'))) {
      setFormError('Check-in date cannot be in the past.');
      return;
    }
    if (nights <= 0) {
      setFormError('Check-out must be after check-in.');
      return;
    }
    if (guests < 1 || guests > maxGuests) {
      setFormError(`Guests must be between 1 and ${maxGuests} for this room.`);
      return;
    }

    setSubmitting(true);
    bookingApi.create({
      roomVariantId: selected.variant.id,
      quantity: 1,
      checkIn: dateRange[0].toISOString(),
      checkOut: dateRange[1].toISOString(),
      totalPrice: total,
      personalWishes: personalWishes || undefined,
    })
      .then(() => setSuccess(true))
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setFormError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Failed to create booking');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <section style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <Typography.Title level={3}>Book {hotel.name}</Typography.Title>

      {options.length === 0
        ? <Alert type="warning" message="No bookable rooms available for this hotel." />
        : (
          <Card>
            <Typography.Text strong>Room</Typography.Text>
            <Radio.Group
              value={variantId}
              onChange={(e) => { setVariantId(e.target.value); setGuests(1); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, marginBottom: 24 }}
            >
              {options.map(({ variant, roomName }) => (
                <Radio key={variant.id} value={variant.id}>
                  {roomName} — ${variant.discountPrice ?? variant.price}/night
                  {' '}(up to {variant.adultCount + variant.childCount} guests)
                </Radio>
              ))}
            </Radio.Group>

            <Typography.Text strong>Dates</Typography.Text>
            <div style={{ marginTop: 8, marginBottom: 24 }}>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(range) => setDateRange(range as [Dayjs, Dayjs] | null)}
                disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
                style={{ width: '100%' }}
              />
            </div>

            <Typography.Text strong>Guests</Typography.Text>
            <div style={{ marginTop: 8, marginBottom: 24 }}>
              <InputNumber min={1} max={maxGuests} value={guests} onChange={(v) => setGuests(v ?? 1)} />
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>max {maxGuests}</Typography.Text>
            </div>

            <Typography.Text strong>Personal wishes (optional)</Typography.Text>
            <Input.TextArea
              value={personalWishes}
              onChange={(e) => setPersonalWishes(e.target.value)}
              rows={3}
              style={{ marginTop: 8, marginBottom: 24 }}
            />

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Typography.Text>{pricePerNight ? `$${pricePerNight} × ${nights} night${nights === 1 ? '' : 's'}` : '—'}</Typography.Text>
              <Typography.Title level={4} style={{ margin: 0 }}>${total}</Typography.Title>
            </div>

            {formError && <Alert type="error" message={formError} style={{ marginBottom: 16 }} />}

            <AppButton variant="primary" onClick={handleSubmit} loading={submitting} block>
              Confirm booking
            </AppButton>
          </Card>
        )}
    </section>
  );
}
