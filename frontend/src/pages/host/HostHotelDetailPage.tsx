import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { Typography, Collapse, List, Tag, Space, Popconfirm, message, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '@features/auth';
import { AppButton } from '@shared/ui';
import { hotelApi } from '@entities/hotel';
import { roomApi, type Room } from '@entities/room';
import { roomVariantApi, type RoomVariant } from '@entities/room-variant';
import type { Hotel } from '@shared/types';
import { RoomFormModal } from './RoomFormModal';
import { RoomVariantFormModal } from './RoomVariantFormModal';

export function HostHotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const { isAuthenticated, user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [variantsByRoom, setVariantsByRoom] = useState<Record<number, RoomVariant[]>>({});
  const [loading, setLoading] = useState(true);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantRoomId, setVariantRoomId] = useState<number | null>(null);
  const [editingVariant, setEditingVariant] = useState<RoomVariant | null>(null);

  const loadRooms = useCallback(async () => {
    const roomList = await roomApi.getByHotelId(hotelId);
    setRooms(roomList);
    const entries = await Promise.all(
      roomList.map(async (room) => [room.id, await roomVariantApi.getByRoomId(room.id)] as const),
    );
    setVariantsByRoom(Object.fromEntries(entries));
  }, [hotelId]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([hotelApi.getById(hotelId), loadRooms()])
      .then(([h]) => setHotel(h))
      .catch(() => message.error('Could not load this hotel'))
      .finally(() => setLoading(false));
  }, [hotelId, loadRooms]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user!.roles.includes('Realtor')) return <Navigate to="/" replace />;

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await roomVariantApi.remove(variantId);
      message.success('Rate removed');
      loadRooms();
    } catch {
      message.error('Could not remove the rate');
    }
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  if (!hotel) return <Empty description="Hotel not found" style={{ padding: 48 }} />;

  return (
    <section style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Link to="/host" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <ArrowLeftOutlined /> Back to my hotels
      </Link>

      <Typography.Title level={3} style={{ marginTop: 0 }}>{hotel.name}</Typography.Title>
      <Typography.Text type="secondary">{hotel.cityName}, {hotel.countryName}</Typography.Text>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Rooms</Typography.Title>
        <AppButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingRoom(null); setRoomModalOpen(true); }}
        >
          Add room
        </AppButton>
      </div>

      {rooms.length === 0 ? (
        <Empty description="No rooms yet" />
      ) : (
        <Collapse
          items={rooms.map((room) => ({
            key: room.id,
            label: (
              <Space>
                <strong>{room.name}</strong>
                <Tag>{room.area} m²</Tag>
                <Tag>{room.quantity} available</Tag>
              </Space>
            ),
            extra: (
              <Space onClick={(e) => e.stopPropagation()}>
                <AppButton
                  variant="tertiary"
                  icon={<EditOutlined />}
                  onClick={() => { setEditingRoom(room); setRoomModalOpen(true); }}
                >
                  Edit
                </AppButton>
                <AppButton
                  variant="tertiary"
                  icon={<PlusOutlined />}
                  onClick={() => { setVariantRoomId(room.id); setEditingVariant(null); setVariantModalOpen(true); }}
                >
                  Add rate
                </AppButton>
              </Space>
            ),
            children: (
              (variantsByRoom[room.id] ?? []).length === 0 ? (
                <Empty description="No rates yet" />
              ) : (
                <List
                  size="small"
                  dataSource={variantsByRoom[room.id]}
                  renderItem={(variant) => (
                    <List.Item
                      actions={[
                        <AppButton
                          key="edit"
                          variant="tertiary"
                          icon={<EditOutlined />}
                          onClick={() => { setVariantRoomId(room.id); setEditingVariant(variant); setVariantModalOpen(true); }}
                        >
                          Edit
                        </AppButton>,
                        <Popconfirm
                          key="delete"
                          title="Remove this rate?"
                          onConfirm={() => handleDeleteVariant(variant.id)}
                        >
                          <AppButton variant="tertiary" danger icon={<DeleteOutlined />}>
                            Remove
                          </AppButton>
                        </Popconfirm>,
                      ]}
                    >
                      <Space>
                        <strong>${variant.price}</strong>
                        {variant.discountPrice != null && <Tag color="green">${variant.discountPrice} w/ discount</Tag>}
                        <Tag>{variant.adultCount} adults, {variant.childCount} children</Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              )
            ),
          }))}
        />
      )}

      <RoomFormModal
        open={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onSaved={loadRooms}
        hotelId={hotelId}
        editingRoom={editingRoom}
      />

      {variantRoomId !== null && (
        <RoomVariantFormModal
          open={variantModalOpen}
          onClose={() => setVariantModalOpen(false)}
          onSaved={loadRooms}
          roomId={variantRoomId}
          editingVariant={editingVariant}
        />
      )}
    </section>
  );
}
