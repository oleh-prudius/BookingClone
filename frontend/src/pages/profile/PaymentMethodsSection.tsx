import { useEffect, useState } from 'react';
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
      setError('Please enter the cardholder name.');
      return;
    }
    if (!luhnCheck(form.number)) {
      setError('Card number is invalid.');
      return;
    }
    const expirationDate = expiryToDateOnly(form.expiry);
    if (!expirationDate) {
      setError('Expiry must be in MM/YY format.');
      return;
    }
    if (new Date(expirationDate).getTime() < Date.now()) {
      setError('Card has expired.');
      return;
    }
    if (!/^\d{3,4}$/.test(form.cvv)) {
      setError('CVV must be 3 or 4 digits.');
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
        message.success(editingId === 'new' ? 'Card added' : 'Card updated');
        cancelEdit();
        loadCards();
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Failed to save card');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: number) => {
    bankCardApi.remove(id)
      .then(() => {
        message.success('Card removed');
        loadCards();
      })
      .catch(() => message.error('Failed to remove card'));
  };

  const editForm = (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <Typography.Text strong>Card number</Typography.Text>
      <Input
        value={form.number}
        onChange={(e) => setForm({ ...form, number: formatCardNumber(e.target.value) })}
        placeholder="4242 4242 4242 4242"
        maxLength={23}
        style={{ marginTop: 8, marginBottom: 12 }}
      />

      <Typography.Text strong>Cardholder name</Typography.Text>
      <Input
        value={form.ownerFullName}
        onChange={(e) => setForm({ ...form, ownerFullName: e.target.value })}
        placeholder="Jane Doe"
        style={{ marginTop: 8, marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>Expiry</Typography.Text>
          <Input
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
            placeholder="MM/YY"
            maxLength={5}
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>CVV</Typography.Text>
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
        <AppButton variant="secondary" onClick={cancelEdit} disabled={submitting}>Cancel</AppButton>
        <AppButton variant="primary" onClick={handleSave} loading={submitting}>Save card</AppButton>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <Typography.Text type="secondary">Saved cards are used to speed up checkout.</Typography.Text>
        {editingId === null && (
          <AppButton variant="primary" onClick={startAdd}>Add card</AppButton>
        )}
      </div>

      {editingId === 'new' && editForm}

      <List
        loading={loading}
        locale={{ emptyText: 'No saved cards yet' }}
        dataSource={cards}
        renderItem={(card) => (
          <div key={card.id}>
            <List.Item
              style={{ padding: '14px 20px' }}
              actions={[
                <AppButton key="edit" variant="secondary" icon={<EditOutlined />} onClick={() => startEdit(card)}>Edit</AppButton>,
                <AppButton key="delete" variant="secondary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(card.id)}>Delete</AppButton>,
              ]}
            >
              <List.Item.Meta
                avatar={<CreditCardOutlined style={{ fontSize: 24 }} />}
                title={maskCardNumber(card.number)}
                description={`${card.ownerFullName} · expires ${dateOnlyToExpiry(card.expirationDate)}`}
              />
            </List.Item>
            {editingId === card.id && editForm}
          </div>
        )}
      />
    </div>
  );
}
