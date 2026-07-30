import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Tag,
  InputNumber,
  Modal,
  message,
  Empty,
  Spin,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { cityApi, type City } from '@entities/city';
import { transportRouteApi, type TransportRoute, type TransportType } from '@entities/transport-route';
import { ticketApi } from '@entities/ticket';
import { useAuth } from '@features/auth';

interface SearchFormValues {
  fromCityId?: number;
  toCityId?: number;
  date?: Dayjs;
  type?: TransportType;
}

const TRANSPORT_TYPES: TransportType[] = ['Bus', 'Train', 'Plane'];

export function TransportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm<SearchFormValues>();

  const [cities, setCities] = useState<City[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [purchasing, setPurchasing] = useState<TransportRoute | null>(null);
  const [seats, setSeats] = useState(1);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    cityApi.getAll().then(setCities).catch(() => setCities([]));
  }, []);

  const handleSearch = async (values: SearchFormValues) => {
    setLoading(true);
    setSearched(true);
    try {
      const result = await transportRouteApi.search({
        fromCityId: values.fromCityId,
        toCityId: values.toCityId,
        date: values.date?.format('YYYY-MM-DD'),
        type: values.type,
        page: 1,
        pageSize: 50,
      });
      setRoutes(result.items);
    } catch {
      message.error(t('transport.searchError'));
    } finally {
      setLoading(false);
    }
  };

  const openPurchase = (route: TransportRoute) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPurchasing(route);
    setSeats(1);
  };

  const confirmPurchase = async () => {
    if (!purchasing) return;
    setBuying(true);
    try {
      await ticketApi.purchase({ transportRouteId: purchasing.id, seats });
      message.success(t('transport.ticketPurchased'));
      setPurchasing(null);
      navigate('/tickets');
    } catch {
      message.error(t('transport.purchaseError'));
    } finally {
      setBuying(false);
    }
  };

  const cityOptions = cities.map((c) => ({ value: c.id, label: `${c.name}, ${c.countryName}` }));

  return (
    <section style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('header.transport')}</Typography.Title>

      <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 24, gap: 12, rowGap: 12 }}>
        <Form.Item name="fromCityId" label={t('transport.from')}>
          <Select
            showSearch
            allowClear
            placeholder={t('transport.selectCity')}
            optionFilterProp="label"
            style={{ width: 220 }}
            options={cityOptions}
          />
        </Form.Item>
        <Form.Item name="toCityId" label={t('transport.to')}>
          <Select
            showSearch
            allowClear
            placeholder={t('transport.selectCity')}
            optionFilterProp="label"
            style={{ width: 220 }}
            options={cityOptions}
          />
        </Form.Item>
        <Form.Item name="date" label={t('transport.date')}>
          <DatePicker />
        </Form.Item>
        <Form.Item name="type" label={t('transport.type')}>
          <Select
            allowClear
            placeholder={t('transport.anyType')}
            style={{ width: 140 }}
            options={TRANSPORT_TYPES.map((v) => ({ value: v, label: t(`transport.types.${v}`) }))}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{t('transport.search')}</Button>
        </Form.Item>
      </Form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : !searched ? null : routes.length === 0 ? (
        <Empty description={t('transport.noRoutes')} />
      ) : (
        <Table
          dataSource={routes}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('transport.type'), dataIndex: 'type', render: (v: TransportType) => <Tag>{t(`transport.types.${v}`)}</Tag> },
            { title: t('transport.from'), dataIndex: 'fromCityName' },
            { title: t('transport.to'), dataIndex: 'toCityName' },
            { title: t('transport.departure'), dataIndex: 'departureUtc', render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm') },
            { title: t('transport.arrival'), dataIndex: 'arrivalUtc', render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm') },
            { title: t('transport.price'), dataIndex: 'price', render: (v: number) => `$${v.toFixed(2)}` },
            { title: t('transport.availableSeats'), dataIndex: 'availableSeats' },
            {
              title: '',
              render: (_: unknown, route: TransportRoute) => (
                <Button
                  type="primary"
                  size="small"
                  disabled={route.availableSeats < 1}
                  onClick={() => openPurchase(route)}
                >
                  {t('transport.buyTicket')}
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={purchasing !== null}
        title={t('transport.buyTicket')}
        onCancel={() => setPurchasing(null)}
        onOk={confirmPurchase}
        confirmLoading={buying}
        okText={t('transport.confirmPurchase')}
      >
        {purchasing && (
          <>
            <Typography.Paragraph>
              {purchasing.fromCityName} → {purchasing.toCityName}, {dayjs(purchasing.departureUtc).format('DD.MM.YYYY HH:mm')}
            </Typography.Paragraph>
            <Form layout="vertical">
              <Form.Item label={t('transport.seats')}>
                <InputNumber
                  min={1}
                  max={purchasing.availableSeats}
                  value={seats}
                  onChange={(v) => setSeats(v ?? 1)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Typography.Text strong>
                {t('transport.total')}: ${(purchasing.price * seats).toFixed(2)}
              </Typography.Text>
            </Form>
          </>
        )}
      </Modal>
    </section>
  );
}
