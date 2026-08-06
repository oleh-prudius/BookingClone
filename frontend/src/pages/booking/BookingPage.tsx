import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs, { type Dayjs } from 'dayjs';
import { Typography, Radio, DatePicker, InputNumber, Input, Alert, Skeleton, Result, Divider, Card } from 'antd';
import { useAuth } from '@features/auth';
import { hotelApi } from '@entities/hotel';
import { roomApi, type Room } from '@entities/room';
import { roomVariantApi, type RoomVariant } from '@entities/room-variant';
import { bookingApi } from '@entities/booking';
import type { Hotel } from '@shared/types';
import { AppButton } from '@shared/ui';
import { formatPrice } from '@shared/lib/currency';
import { useCurrency } from '@shared/theme/CurrencyContext';
import { PaymentForm } from './PaymentForm';

interface BookableVariant {
  variant: RoomVariant;
  roomName: string;
}

export function BookingPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const { isAuthenticated } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [options, setOptions] = useState<BookableVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [variantId, setVariantId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [guests, setGuests] = useState(1);
  const [personalWishes, setPersonalWishes] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

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
        title={t('hotel.notFoundTitle')}
        extra={<AppButton variant="primary" onClick={() => navigate('/hotels')}>{t('hotel.backToSearch')}</AppButton>}
      />
    );
  }

  if (step === 'success') {
    return (
      <Result
        status="success"
        title={t('booking.bookingCreated')}
        subTitle={t('booking.bookingCreatedSubtitle', { hotelName: hotel.name })}
        extra={<AppButton variant="primary" onClick={() => navigate('/my-bookings')}>{t('booking.viewMyBookings')}</AppButton>}
      />
    );
  }

  const handleContinueToPayment = () => {
    setFormError(null);

    if (!selected) {
      setFormError(t('booking.errors.selectRoom'));
      return;
    }
    if (!dateRange) {
      setFormError(t('booking.errors.selectDates'));
      return;
    }
    if (dateRange[0].startOf('day').isBefore(dayjs().startOf('day'))) {
      setFormError(t('booking.errors.checkInInPast'));
      return;
    }
    if (nights <= 0) {
      setFormError(t('booking.errors.checkOutBeforeCheckIn'));
      return;
    }
    if (guests < 1 || guests > maxGuests) {
      setFormError(t('booking.errors.guestsOutOfRange', { maxGuests }));
      return;
    }

    setStep('payment');
  };

  const handlePay = async () => {
    if (!selected || !dateRange) return;

    await bookingApi.create({
      roomVariantId: selected.variant.id,
      quantity: 1,
      checkIn: dateRange[0].toISOString(),
      checkOut: dateRange[1].toISOString(),
      totalPrice: total,
      personalWishes: personalWishes || undefined,
    });
    setStep('success');
  };

  if (step === 'payment' && selected && dateRange) {
    return (
      <section style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
        <Typography.Title level={3}>{t('booking.bookHotel', { hotelName: hotel.name })}</Typography.Title>
        <PaymentForm
          order={{
            hotelName: hotel.name,
            roomName: selected.roomName,
            checkIn: dateRange[0].format('MMM D, YYYY'),
            checkOut: dateRange[1].format('MMM D, YYYY'),
            nights,
            pricePerNight,
            total,
          }}
          onBack={() => setStep('details')}
          onPay={handlePay}
        />
      </section>
    );
  }

  return (
    <section style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <Typography.Title level={3}>Book {hotel.name}</Typography.Title>

      {options.length === 0
        ? <Alert type="warning" message={t('booking.noBookableRooms')} />
        : (
          <Card>
            <Typography.Text strong>{t('booking.room')}</Typography.Text>
            <Radio.Group
              value={variantId}
              onChange={(e) => { setVariantId(e.target.value); setGuests(1); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, marginBottom: 24 }}
            >
              {options.map(({ variant, roomName }) => (
                <Radio key={variant.id} value={variant.id}>
                  {t('booking.roomOption', {
                    roomName,
                    price: variant.discountPrice ?? variant.price,
                    maxGuests: variant.adultCount + variant.childCount,
                  })}
                </Radio>
              ))}
            </Radio.Group>

            <Typography.Text strong>{t('booking.dates')}</Typography.Text>
            <div style={{ marginTop: 8, marginBottom: 24 }}>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(range) => setDateRange(range as [Dayjs, Dayjs] | null)}
                disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
                style={{ width: '100%' }}
              />
            </div>

            <Typography.Text strong>{t('booking.guests')}</Typography.Text>
            <div style={{ marginTop: 8, marginBottom: 24 }}>
              <InputNumber min={1} max={maxGuests} value={guests} onChange={(v) => setGuests(v ?? 1)} />
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>{t('booking.maxGuests', { maxGuests })}</Typography.Text>
            </div>

            <Typography.Text strong>{t('booking.personalWishes')}</Typography.Text>
            <Input.TextArea
              value={personalWishes}
              onChange={(e) => setPersonalWishes(e.target.value)}
              rows={3}
              style={{ marginTop: 8, marginBottom: 24 }}
            />

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Typography.Text>{pricePerNight ? t('booking.priceTimesNights', { price: pricePerNight, count: nights }) : '—'}</Typography.Text>
              <Typography.Title level={4} style={{ margin: 0 }}>{formatPrice(total, currency)}</Typography.Title>
            </div>

            {formError && <Alert type="error" message={formError} style={{ marginBottom: 16 }} />}

            <AppButton variant="primary" onClick={handleContinueToPayment} block>
              {t('booking.continueToPayment')}
            </AppButton>
          </Card>
        )}
    </section>
  );
}
