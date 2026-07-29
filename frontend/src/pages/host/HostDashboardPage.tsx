import { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Typography, Card, List, Tag, Space, Popconfirm, message, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@features/auth';
import { AppButton } from '@shared/ui';
import { hotelApi } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { HotelFormModal } from './HotelFormModal';

export function HostDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    hotelApi.getByRealtorId(user.id)
      .then(setHotels)
      .catch(() => message.error('Could not load your hotels'))
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
      message.success('Hotel removed');
      load();
    } catch {
      message.error('Could not remove the hotel');
    }
  };

  return (
    <section style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>My hotels</Typography.Title>
        <AppButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingHotel(null); setModalOpen(true); }}
        >
          Add hotel
        </AppButton>
      </div>

      <Card loading={loading}>
        {hotels.length === 0 && !loading ? (
          <Empty description="You haven't listed any hotels yet" />
        ) : (
          <List
            dataSource={hotels}
            renderItem={(hotel) => (
              <List.Item
                actions={[
                  <Link key="manage" to={`/host/hotels/${hotel.id}`}>Manage rooms</Link>,
                  <AppButton
                    key="edit"
                    variant="tertiary"
                    icon={<EditOutlined />}
                    onClick={() => { setEditingHotel(hotel); setModalOpen(true); }}
                  >
                    Edit
                  </AppButton>,
                  <Popconfirm
                    key="delete"
                    title="Remove this hotel?"
                    description="This cannot be undone."
                    onConfirm={() => handleDelete(hotel.id)}
                  >
                    <AppButton variant="tertiary" danger icon={<DeleteOutlined />}>
                      Remove
                    </AppButton>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={hotel.name}
                  description={
                    <Space>
                      <span>{hotel.cityName}, {hotel.countryName}</span>
                      <Tag>{hotel.hotelCategoryName}</Tag>
                      <Tag>{hotel.starRating}★</Tag>
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
