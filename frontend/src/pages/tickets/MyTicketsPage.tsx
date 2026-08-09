import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Typography, List, Card, Tag, Spin, Empty } from 'antd';
import dayjs from 'dayjs';
import { ticketApi, type Ticket } from '@entities/ticket';
import { useAuth } from '@features/auth';
import { formatPrice } from '@shared/lib/currency';
import { useCurrency } from '@shared/theme/CurrencyContext';

export function MyTicketsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { currency } = useCurrency();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    ticketApi.getMine()
      .then((result) => setTickets(result.items))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <section style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('header.tickets')}</Typography.Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : tickets.length === 0 ? (
        <Empty description={t('tickets.noTickets')} />
      ) : (
        <List
          dataSource={tickets}
          renderItem={(ticket) => (
            <List.Item>
              <Card style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography.Text strong>{ticket.fromCityName} → {ticket.toCityName}</Typography.Text>
                    <div>
                      <Typography.Text type="secondary">
                        {dayjs(ticket.departureUtc).format('DD.MM.YYYY HH:mm')} — {dayjs(ticket.arrivalUtc).format('DD.MM.YYYY HH:mm')}
                      </Typography.Text>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Tag>{t('tickets.seats', { count: ticket.seats })}</Tag>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Typography.Text strong>{formatPrice(ticket.totalPrice, currency)}</Typography.Text>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {t('tickets.purchasedOn', { date: dayjs(ticket.purchasedAtUtc).format('DD.MM.YYYY') })}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </section>
  );
}
