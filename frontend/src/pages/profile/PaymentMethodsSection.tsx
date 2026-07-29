import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List, Typography, Input, Alert, App } from 'antd';
import { CreditCardOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '@features/auth';
import { bankCardApi, type BankCard } from '@entities/bank-card';
import { AppButton } from '@shared/ui';
import { formatCardNumber, formatExpiry, luhnCheck, maskCardNumber } from '@shared/lib/cardFormat';

function expiryToDateOnly(expiry: string): string | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  const year = 2000 + Number(match[2]);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function dateOnlyToExpiry(dateOnly: string): string {
  const [year, month] = dateOnly.split('-');
  return `${month}/${year.slice(2)}`;
}

interface CardFormState {
  number: string;
  expiry: string;
  cvv: string;
  ownerFullName: string;
}

const EMPTY_FORM: CardFormState = { number: '', expiry: '', cvv: '', ownerFullName: '' };

export function PaymentMethodsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [cards, setCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<CardFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCards = () => {
    if (!user) return;
    setLoading(true);
    bankCardApi.getByCustomerId(user.id)
      .then(setCards)
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadCards, [user]);

  const startAdd = () => {
    setEditingId('new');
    setForm(EMPTY_FORM);
    setError(null);
  };

  const startEdit = (card: BankCard) => {
    setEditingId(card.id);
    setForm({
      number: '',
      expiry: dateOnlyToExpiry(card.expirationDate),
      cvv: '',
      ownerFullName: card.ownerFullName,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleSave = () => {
    if (!user) return;
    setError(null);

    if (!form.ownerFullName.trim()) {
      setError(t('booking.payment.errors.cardholderNameRequired'));
      return;
    }
    if (!luhnCheck(form.number)) {
      setError(t('booking.payment.errors.cardNumberInvalid'));
      return;
    }
    const expirationDate = expiryToDateOnly(form.expiry);
    if (!expirationDate) {
      setError(t('booking.payment.errors.expiryFormat'));
      return;
    }
    if (new Date(expirationDate).getTime() < Date.now()) {
      setError(t('booking.payment.errors.cardExpired'));
      return;
    }
    if (!/^\d{3,4}$/.test(form.cvv)) {
      setError(t('booking.payment.errors.cvvInvalid'));
      return;
    }

    const dto = {
      number: form.number.replace(/\D/g, ''),
      expirationDate,
      cvv: form.cvv,
      ownerFullName: form.ownerFullName.trim(),
    };

    setSubmitting(true);
    const request = editingId === 'new'
      ? bankCardApi.create(user.id, dto)
      : bankCardApi.update(editingId as number, dto);

    request
      .then(() => {
        message.success(editingId === 'new' ? t('profile.paymentMethods.cardAdded') : t('profile.paymentMethods.cardUpdated'));
        cancelEdit();
        loadCards();
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr.response?.data?.error ?? axiosErr.message ?? t('profile.paymentMethods.saveFailed'));
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: number) => {
    bankCardApi.remove(id)
      .then(() => {
        message.success(t('profile.paymentMethods.cardRemoved'));
        loadCards();
      })
      .catch(() => message.error(t('profile.paymentMethods.removeFailed')));
  };

  const editForm = (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <Typography.Text strong>{t('booking.payment.cardNumber')}</Typography.Text>
      <Input
        value={form.number}
        onChange={(e) => setForm({ ...form, number: formatCardNumber(e.target.value) })}
        placeholder="4242 4242 4242 4242"
        maxLength={23}
        style={{ marginTop: 8, marginBottom: 12 }}
      />

      <Typography.Text strong>{t('booking.payment.cardholderName')}</Typography.Text>
      <Input
        value={form.ownerFullName}
        onChange={(e) => setForm({ ...form, ownerFullName: e.target.value })}
        placeholder="Jane Doe"
        style={{ marginTop: 8, marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>{t('booking.payment.expiry')}</Typography.Text>
          <Input
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
            placeholder="MM/YY"
            maxLength={5}
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>{t('booking.payment.cvv')}</Typography.Text>
          <Input
            value={form.cvv}
            onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="123"
            maxLength={4}
            style={{ marginTop: 8 }}
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}

      <div style={{ display: 'flex', gap: 8 }}>
        <AppButton variant="secondary" onClick={cancelEdit} disabled={submitting}>{t('common.cancel')}</AppButton>
        <AppButton variant="primary" onClick={handleSave} loading={submitting}>{t('profile.paymentMethods.saveCard')}</AppButton>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <Typography.Text type="secondary">{t('profile.paymentMethods.description')}</Typography.Text>
        {editingId === null && (
          <AppButton variant="primary" onClick={startAdd}>{t('profile.paymentMethods.addCard')}</AppButton>
        )}
      </div>

      {editingId === 'new' && editForm}

      <List
        loading={loading}
        locale={{ emptyText: t('profile.paymentMethods.noSavedCards') }}
        dataSource={cards}
        renderItem={(card) => (
          <div key={card.id}>
            <List.Item
              style={{ padding: '14px 20px' }}
              actions={[
                <AppButton key="edit" variant="secondary" icon={<EditOutlined />} onClick={() => startEdit(card)}>{t('common.edit')}</AppButton>,
                <AppButton key="delete" variant="secondary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(card.id)}>{t('common.delete')}</AppButton>,
              ]}
            >
              <List.Item.Meta
                avatar={<CreditCardOutlined style={{ fontSize: 24 }} />}
                title={maskCardNumber(card.number)}
                description={t('profile.paymentMethods.cardExpiresLabel', { owner: card.ownerFullName, expiry: dateOnlyToExpiry(card.expirationDate) })}
              />
            </List.Item>
            {editingId === card.id && editForm}
          </div>
        )}
      />
    </div>
  );
}
