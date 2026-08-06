import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Collapse, List, Tag, Space, Popconfirm, message, Empty, Spin, Upload, Image } from 'antd';
import type { UploadProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '@features/auth';
import { AppButton } from '@shared/ui';
import { hotelApi } from '@entities/hotel';
import { hotelPhotoApi, type HotelPhoto } from '@entities/hotel-photo';
import { roomApi, type Room } from '@entities/room';
import { roomVariantApi, type RoomVariant } from '@entities/room-variant';
import type { Hotel } from '@shared/types';
import { formatPrice } from '@shared/lib/currency';
import { useCurrency } from '@shared/theme/CurrencyContext';
import { RoomFormModal } from './RoomFormModal';
import { RoomVariantFormModal } from './RoomVariantFormModal';

export function HostHotelDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const { isAuthenticated, user } = useAuth();
  const { currency } = useCurrency();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [variantsByRoom, setVariantsByRoom] = useState<Record<number, RoomVariant[]>>({});
  const [photos, setPhotos] = useState<HotelPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

  const loadPhotos = useCallback(async () => {
    setPhotos(await hotelPhotoApi.getByHotelId(hotelId));
  }, [hotelId]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([hotelApi.getById(hotelId), loadRooms(), loadPhotos()])
      .then(([h]) => setHotel(h))
      .catch(() => message.error(t('host.detail.loadError')))
      .finally(() => setLoading(false));
  }, [hotelId, loadRooms, loadPhotos]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user!.roles.includes('Realtor')) return <Navigate to="/" replace />;

  const handleUploadPhoto: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingPhoto(true);
    try {
      await hotelPhotoApi.upload(hotelId, file as File, photos.length);
      message.success(t('host.detail.photoUploaded'));
      await loadPhotos();
      onSuccess?.({});
    } catch (err) {
      message.error(t('host.detail.photoUploadError'));
      onError?.(err as Error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await hotelPhotoApi.remove(photoId);
      message.success(t('host.detail.photoRemoved'));
      loadPhotos();
    } catch {
      message.error(t('host.detail.photoRemoveError'));
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await roomVariantApi.remove(variantId);
      message.success(t('host.detail.rateRemoved'));
      loadRooms();
    } catch {
      message.error(t('host.detail.rateRemoveError'));
    }
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  if (!hotel) return <Empty description={t('host.detail.hotelNotFound')} style={{ padding: 48 }} />;

  return (
    <section style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Link to="/host" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <ArrowLeftOutlined /> {t('host.detail.backToMyHotels')}
      </Link>

      <Typography.Title level={3} style={{ marginTop: 0 }}>{hotel.name}</Typography.Title>
      <Typography.Text type="secondary">{hotel.cityName}, {hotel.countryName}</Typography.Text>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('host.detail.photos')}</Typography.Title>
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={handleUploadPhoto}
          disabled={uploadingPhoto}
        >
          <AppButton variant="primary" icon={<PlusOutlined />} loading={uploadingPhoto}>
            {t('host.detail.addPhoto')}
          </AppButton>
        </Upload>
      </div>

      {photos.length === 0 ? (
        <Empty description={t('host.detail.noPhotosYet')} />
      ) : (
        <Image.PreviewGroup>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{ position: 'relative', width: 140, height: 100 }}>
                <Image
                  src={photo.name}
                  alt=""
                  width={140}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 6 }}
                />
                <Popconfirm
                  title={t('host.detail.removePhotoConfirmTitle')}
                  onConfirm={() => handleDeletePhoto(photo.id)}
                >
                  <AppButton
                    variant="tertiary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.9)' }}
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('host.detail.rooms')}</Typography.Title>
        <AppButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingRoom(null); setRoomModalOpen(true); }}
        >
          {t('host.detail.addRoom')}
        </AppButton>
      </div>

      {rooms.length === 0 ? (
        <Empty description={t('host.detail.noRoomsYet')} />
      ) : (
        <Collapse
          items={rooms.map((room) => ({
            key: room.id,
            label: (
              <Space>
                <strong>{room.name}</strong>
                <Tag>{t('host.detail.areaSqm', { area: room.area })}</Tag>
                <Tag>{t('host.detail.availableCount', { count: room.quantity })}</Tag>
              </Space>
            ),
            extra: (
              <Space onClick={(e) => e.stopPropagation()}>
                <AppButton
                  variant="tertiary"
                  icon={<EditOutlined />}
                  onClick={() => { setEditingRoom(room); setRoomModalOpen(true); }}
                >
                  {t('common.edit')}
                </AppButton>
                <AppButton
                  variant="tertiary"
                  icon={<PlusOutlined />}
                  onClick={() => { setVariantRoomId(room.id); setEditingVariant(null); setVariantModalOpen(true); }}
                >
                  {t('host.detail.addRate')}
                </AppButton>
              </Space>
            ),
            children: (
              (variantsByRoom[room.id] ?? []).length === 0 ? (
                <Empty description={t('host.detail.noRatesYet')} />
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
                          {t('common.edit')}
                        </AppButton>,
                        <Popconfirm
                          key="delete"
                          title={t('host.detail.removeRateConfirmTitle')}
                          onConfirm={() => handleDeleteVariant(variant.id)}
                        >
                          <AppButton variant="tertiary" danger icon={<DeleteOutlined />}>
                            {t('common.remove')}
                          </AppButton>
                        </Popconfirm>,
                      ]}
                    >
                      <Space>
                        <strong>{formatPrice(variant.price, currency)}</strong>
                        {variant.discountPrice != null && <Tag color="green">{t('host.detail.discountPrice', { price: variant.discountPrice })}</Tag>}
                        <Tag>{t('host.detail.adultsChildren', { adults: variant.adultCount, children: variant.childCount })}</Tag>
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
