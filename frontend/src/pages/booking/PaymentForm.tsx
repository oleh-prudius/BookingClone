import { useEffect, useState } from 'react';
import { Card, Typography, Input, Alert, Divider, Radio } from 'antd';
import { AppButton } from '@shared/ui';
import { formatCardNumber, formatExpiry, luhnCheck, maskCardNumber } from '@shared/lib/cardFormat';
import { useAuth } from '@features/auth';
import { bankCardApi, type BankCard } from '@entities/bank-card';

interface OrderSummary {
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  total: number;
}

interface PaymentFormProps {
  order: OrderSummary;
  onBack: () => void;
  onPay: () => Promise<void>;
}

function dateOnlyToExpiry(dateOnly: string): string {
  const [year, month] = dateOnly.split('-');
  return `${month}/${year.slice(2)}`;
}

export function PaymentForm({ order, onBack, onPay }: PaymentFormProps) {
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState<BankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | 'new'>('new');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    bankCardApi.getByCustomerId(user.id)
      .then((cards) => {
        setSavedCards(cards);
        if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
          setCardNumber(formatCardNumber(cards[0].number));
          setCardName(cards[0].ownerFullName);
          setExpiry(dateOnlyToExpiry(cards[0].expirationDate));
        }
      })
      .catch(() => setSavedCards([]));
  }, [user]);

  const selectSavedCard = (card: BankCard) => {
    setSelectedCardId(card.id);
    setCardNumber(formatCardNumber(card.number));
    setCardName(card.ownerFullName);
    setExpiry(dateOnlyToExpiry(card.expirationDate));
    setCvv('');
    setError(null);
  };

  const selectNewCard = () => {
    setSelectedCardId('new');
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setError(null);
  };

  const usingSavedCard = selectedCardId !== 'new';

  const handleSubmit = async () => {
    setError(null);

    if (!cardName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (!luhnCheck(cardNumber)) {
      setError('Card number is invalid.');
      return;
    }
    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!expiryMatch) {
      setError('Expiry must be in MM/YY format.');
      return;
    }
    const month = Number(expiryMatch[1]);
    if (month < 1 || month > 12) {
      setError('Expiry month is invalid.');
      return;
    }
    const expiryDate = new Date(2000 + Number(expiryMatch[2]), month);
    if (expiryDate.getTime() < Date.now()) {
      setError('Card has expired.');
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError('CVV must be 3 or 4 digits.');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await onPay();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>Order summary</Typography.Title>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Typography.Text>{order.hotelName} · {order.roomName}</Typography.Text>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Typography.Text type="secondary">{order.checkIn} – {order.checkOut}</Typography.Text>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Text type="secondary">${order.pricePerNight} × {order.nights} night{order.nights === 1 ? '' : 's'}</Typography.Text>
        <Typography.Title level={4} style={{ margin: 0 }}>${order.total}</Typography.Title>
      </div>

      <Divider />

      <Typography.Title level={4}>Payment details</Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        This is a demo checkout — no real card data is sent or stored.
      </Typography.Text>

      {savedCards.length > 0 && (
        <Radio.Group
          value={selectedCardId}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}
        >
          {savedCards.map((c) => (
            <Radio key={c.id} value={c.id} onClick={() => selectSavedCard(c)}>
              {maskCardNumber(c.number)} · {c.ownerFullName} · exp {dateOnlyToExpiry(c.expirationDate)}
            </Radio>
          ))}
          <Radio value="new" onClick={selectNewCard}>
            Use a new card
          </Radio>
        </Radio.Group>
      )}

      <Typography.Text strong>Card number</Typography.Text>
      <Input
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        placeholder="4242 4242 4242 4242"
        maxLength={19}
        disabled={usingSavedCard}
        style={{ marginTop: 8, marginBottom: 16 }}
      />

      <Typography.Text strong>Cardholder name</Typography.Text>
      <Input
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        placeholder="Jane Doe"
        disabled={usingSavedCard}
        style={{ marginTop: 8, marginBottom: 16 }}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>Expiry</Typography.Text>
          <Input
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            disabled={usingSavedCard}
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>CVV</Typography.Text>
          <Input
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
            style={{ marginTop: 8 }}
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

      <div style={{ display: 'flex', gap: 12 }}>
        <AppButton variant="secondary" onClick={onBack} disabled={submitting}>
          Back
        </AppButton>
        <AppButton variant="primary" onClick={handleSubmit} loading={submitting} block>
          Pay ${order.total}
        </AppButton>
      </div>
    </Card>
  );
}
