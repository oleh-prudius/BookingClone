import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Form,
  Select,
  DatePicker,
  Tag,
  InputNumber,
  Modal,
  Radio,
  message,
  Empty,
  Spin,
} from 'antd';
import { CarOutlined, GatewayOutlined, RocketOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { cityApi, type City } from '@entities/city';
import { transportRouteApi, type TransportRoute, type TransportType } from '@entities/transport-route';
import { ticketApi } from '@entities/ticket';
import { useAuth } from '@features/auth';
import { formatPrice } from '@shared/lib/currency';
import { localizeCityName, localizeCountryName } from '@shared/lib/geoNames';
import { useCurrency } from '@shared/theme/CurrencyContext';
import { AppButton } from '@shared/ui';

interface SearchFormValues {
  fromCityId?: number;
  toCityId?: number;
  date?: Dayjs;
  type?: TransportType;
}

const TRANSPORT_TYPES: TransportType[] = ['Bus', 'Train', 'Plane'];

// No dedicated bus/train icons exist in @ant-design/icons — closest available stand-ins.
const TRANSPORT_TYPE_ICONS: Record<TransportType, ReactNode> = {
  Bus: <CarOutlined />,
  Train: <GatewayOutlined />,
  Plane: <RocketOutlined />,
};

export function TransportPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currency } = useCurrency();
  const [form] = Form.useForm<SearchFormValues>();

  const [cities, setCities] = useState<City[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [purchasing, setPurchasing] = useState<TransportRoute | null>(null);
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'mastercard'>('visa');
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
    setPaymentMethod('visa');
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

  const cityOptions = cities.map((c) => ({
    value: c.id,
    label: `${localizeCityName(c.name, i18n.language)}, ${localizeCountryName(c.countryName, i18n.language)}`,
  }));

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
            options={TRANSPORT_TYPES.map((v) => ({
              value: v,
              label: <span>{TRANSPORT_TYPE_ICONS[v]} {t(`transport.types.${v}`)}</span>,
            }))}
          />
        </Form.Item>
        <Form.Item>
          <AppButton htmlType="submit">{t('transport.search')}</AppButton>
        </Form.Item>
      </Form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : !searched ? null : routes.length === 0 ? (
        <Empty description={t('transport.noRoutes')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {routes.map((route) => (
            <div
              key={route.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 15,
                boxShadow: '0 0 8px rgba(0,0,0,0.15)',
                padding: 16,
              }}
            >
              <div style={{
                width: 245,
                height: 150,
                flexShrink: 0,
                borderRadius: 10,
                background: 'var(--triply-backgroundLight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
              }}>
                {TRANSPORT_TYPE_ICONS[route.type]}
              </div>

              <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  {route.carrierName}
                  {route.vehicleModel && (
                    <span style={{ fontWeight: 400, fontSize: 16, color: 'var(--text)' }}> · {route.vehicleModel}</span>
                  )}
                </div>
                <div style={{ fontSize: 18, color: 'var(--text)' }}>
                  {localizeCityName(route.fromCityName, i18n.language)} → <strong>{localizeCityName(route.toCityName, i18n.language)}</strong>
                </div>
                <div style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text)' }}>
                  {dayjs(route.departureUtc).format('DD.MM.YYYY HH:mm')} — {dayjs(route.arrivalUtc).format('DD.MM.YYYY HH:mm')}
                </div>
                <div>
                  <Tag>{t(`transport.types.${route.type}`)}</Tag>
                  <Tag>{t('transport.availableSeats')}: {route.availableSeats}</Tag>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, minWidth: 180 }}>
                <div style={{ fontSize: 24, fontWeight: 600 }}>{formatPrice(route.price, currency)}</div>
                <AppButton
                  variant="primary"
                  disabled={route.availableSeats < 1}
                  onClick={() => openPurchase(route)}
                  style={{ minWidth: 180 }}
                >
                  {t('transport.buyTicket')}
                </AppButton>
              </div>
            </div>
          ))}
        </div>
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
              {TRANSPORT_TYPE_ICONS[purchasing.type]} {localizeCityName(purchasing.fromCityName, i18n.language)} → {localizeCityName(purchasing.toCityName, i18n.language)}, {dayjs(purchasing.departureUtc).format('DD.MM.YYYY HH:mm')}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginTop: -12 }}>
              {purchasing.carrierName}{purchasing.vehicleModel ? ` · ${purchasing.vehicleModel}` : ''}
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
                {t('transport.total')}: {formatPrice(purchasing.price * seats, currency)}
              </Typography.Text>

              <Form.Item label={t('transport.paymentMethod')} style={{ marginTop: 16, marginBottom: 0 }}>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { label: 'Visa', value: 'visa' },
                    { label: 'Mastercard', value: 'mastercard' },
                  ]}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </section>
  );
}
