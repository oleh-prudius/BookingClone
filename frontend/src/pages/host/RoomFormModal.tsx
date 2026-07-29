import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import { roomTypeApi, type RoomType } from '@entities/room-type';
import { roomApi, type Room } from '@entities/room';

interface FormValues {
  name: string;
  area: number;
  numberOfRooms: number;
  quantity: number;
  roomTypeId: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  hotelId: number;
  editingRoom?: Room | null;
}

export function RoomFormModal({ open, onClose, onSaved, hotelId, editingRoom }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    roomTypeApi.getAll().then(setRoomTypes).catch(() => setRoomTypes([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editingRoom) {
      form.setFieldsValue({
        name: editingRoom.name,
        area: editingRoom.area,
        numberOfRooms: editingRoom.numberOfRooms,
        quantity: editingRoom.quantity,
        roomTypeId: editingRoom.roomTypeId,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ numberOfRooms: 1, quantity: 1 });
    }
  }, [open, editingRoom, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const dto = {
        name: values.name,
        area: values.area,
        numberOfRooms: values.numberOfRooms,
        quantity: values.quantity,
        hotelId,
        roomTypeId: values.roomTypeId,
      };

      if (editingRoom) {
        await roomApi.update(editingRoom.id, dto);
      } else {
        await roomApi.create(dto);
      }

      message.success(editingRoom ? t('host.roomForm.roomUpdated') : t('host.roomForm.roomAdded'));
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('host.roomForm.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editingRoom ? t('host.roomForm.editRoom') : t('host.roomForm.addRoom')}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={editingRoom ? t('common.save') : t('common.add')}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label={t('host.roomForm.name')} name="name" rules={[{ required: true }]}>
          <Input placeholder={t('host.roomForm.namePlaceholder')} />
        </Form.Item>
        <Form.Item label={t('host.roomForm.roomType')} name="roomTypeId" rules={[{ required: true, message: t('host.roomForm.selectRoomType') }]}>
          <Select placeholder={t('host.roomForm.selectRoomType')} options={roomTypes.map((rt) => ({ value: rt.id, label: rt.name }))} />
        </Form.Item>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label={t('host.roomForm.areaSqm')} name="area" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('host.roomForm.rooms')} name="numberOfRooms" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('host.roomForm.quantity')} name="quantity" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
