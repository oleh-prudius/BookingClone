import { useState } from 'react';
import { Card, Typography, Input, Alert, Divider } from 'antd';
import { AppButton } from '@shared/ui';

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

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnCheck(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function PaymentForm({ order, onBack, onPay }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

      <Typography.Text strong>Card number</Typography.Text>
      <Input
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        placeholder="4242 4242 4242 4242"
        maxLength={19}
        style={{ marginTop: 8, marginBottom: 16 }}
      />

      <Typography.Text strong>Cardholder name</Typography.Text>
      <Input
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        placeholder="Jane Doe"
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
