import { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Card, List, Tag, Space, Popconfirm, message, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@features/auth';
import { AppButton } from '@shared/ui';
import { hotelApi } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { formatPrice } from '@shared/lib/currency';
import { useCurrency } from '@shared/theme/CurrencyContext';
import { HotelFormModal } from './HotelFormModal';

export function HostDashboardPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { currency } = useCurrency();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    hotelApi.getByRealtorId(user.id)
      .then(setHotels)
      .catch(() => message.error(t('host.dashboard.loadError')))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user!.roles.includes('Realtor')) return <Navigate to="/" replace />;

  const handleDelete = async (id: number) => {
    try {
      await hotelApi.remove(id);
      message.success(t('host.dashboard.hotelRemoved'));
      load();
    } catch {
      message.error(t('host.dashboard.removeError'));
    }
  };

  return (
    <section style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>{t('host.dashboard.title')}</Typography.Title>
        <AppButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingHotel(null); setModalOpen(true); }}
        >
          {t('host.dashboard.addHotel')}
        </AppButton>
      </div>

      <Card loading={loading}>
        {hotels.length === 0 && !loading ? (
          <Empty description={t('host.dashboard.noHotelsYet')} />
        ) : (
          <List
            dataSource={hotels}
            renderItem={(hotel) => (
              <List.Item
                actions={[
                  <Link key="manage" to={`/host/hotels/${hotel.id}`}>{t('host.dashboard.manageRooms')}</Link>,
                  <AppButton
                    key="edit"
                    variant="tertiary"
                    icon={<EditOutlined />}
                    onClick={() => { setEditingHotel(hotel); setModalOpen(true); }}
                  >
                    {t('common.edit')}
                  </AppButton>,
                  <Popconfirm
                    key="delete"
                    title={t('host.dashboard.removeHotelConfirmTitle')}
                    description={t('host.dashboard.removeHotelConfirmDescription')}
                    onConfirm={() => handleDelete(hotel.id)}
                  >
                    <AppButton variant="tertiary" danger icon={<DeleteOutlined />}>
                      {t('common.remove')}
                    </AppButton>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={hotel.coverPhotoUrl ?? 'https://placehold.co/96x72?text=No+Photo'}
                      alt={hotel.name}
                      style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 12 }}
                    />
                  }
                  title={hotel.name}
                  description={
                    <Space direction="vertical" size={4}>
                      <Space>
                        <span>{hotel.cityName}, {hotel.countryName}</span>
                        <Tag>{hotel.hotelCategoryName}</Tag>
                        <Tag>{hotel.starRating}★</Tag>
                      </Space>
                      {hotel.pricePerNight != null && (
                        <span style={{ fontWeight: 700, color: 'var(--triply-primary)' }}>
                          {formatPrice(hotel.pricePerNight, currency)}
                        </span>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <HotelFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        realtorId={user!.id}
        editingHotel={editingHotel}
      />
    </section>
  );
}
