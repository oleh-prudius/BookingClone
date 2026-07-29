import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import { cityApi, type City } from '@entities/city';
import { hotelCategoryApi, type HotelCategory } from '@entities/hotel-category';
import { addressApi } from '@entities/address';
import { hotelApi } from '@entities/hotel';
import type { Hotel } from '@shared/types';

interface FormValues {
  name: string;
  description: string;
  cityId: number;
  street: string;
  houseNumber: string;
  hotelCategoryId: number;
  starRating: number;
  arrivalFrom: string;
  arrivalTo: string;
  departureFrom: string;
  departureTo: string;
}

function toIso(time: string): string {
  return `2000-01-01T${time}:00Z`;
}

function toTimeInput(iso: string): string {
  return iso.slice(11, 16);
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  realtorId: number;
  editingHotel?: Hotel | null;
}

export function HotelFormModal({ open, onClose, onSaved, realtorId, editingHotel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<HotelCategory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    cityApi.getAll().then(setCities).catch(() => setCities([]));
    hotelCategoryApi.getAll().then(setCategories).catch(() => setCategories([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editingHotel) {
      form.setFieldsValue({
        name: editingHotel.name,
        description: editingHotel.description,
        hotelCategoryId: editingHotel.hotelCategoryId,
        starRating: editingHotel.starRating,
        arrivalFrom: toTimeInput(editingHotel.arrivalTimeUtcFrom),
        arrivalTo: toTimeInput(editingHotel.arrivalTimeUtcTo),
        departureFrom: toTimeInput(editingHotel.departureTimeUtcFrom),
        departureTo: toTimeInput(editingHotel.departureTimeUtcTo),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ starRating: 3, arrivalFrom: '14:00', arrivalTo: '22:00', departureFrom: '07:00', departureTo: '12:00' });
    }
  }, [open, editingHotel, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const arrivalTimeUtcFrom = toIso(values.arrivalFrom);
      const arrivalTimeUtcTo = toIso(values.arrivalTo);
      const departureTimeUtcFrom = toIso(values.departureFrom);
      const departureTimeUtcTo = toIso(values.departureTo);

      if (editingHotel) {
        await hotelApi.update(editingHotel.id, {
          name: values.name,
          description: values.description,
          addressId: editingHotel.addressId,
          hotelCategoryId: values.hotelCategoryId,
          starRating: values.starRating,
          arrivalTimeUtcFrom,
          arrivalTimeUtcTo,
          departureTimeUtcFrom,
          departureTimeUtcTo,
        });
      } else {
        const address = await addressApi.create({
          street: values.street,
          houseNumber: values.houseNumber,
          cityId: values.cityId,
        });

        await hotelApi.create({
          name: values.name,
          description: values.description,
          addressId: address.id,
          hotelCategoryId: values.hotelCategoryId,
          realtorId,
          starRating: values.starRating,
          arrivalTimeUtcFrom,
          arrivalTimeUtcTo,
          departureTimeUtcFrom,
          departureTimeUtcTo,
        });
      }

      message.success(editingHotel ? 'Hotel updated' : 'Hotel created');
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Could not save the hotel. Please check the form and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editingHotel ? 'Edit hotel' : 'Add a new hotel'}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={editingHotel ? 'Save' : 'Create'}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true, max: 255 }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ required: true, max: 4000 }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        {!editingHotel && (
          <>
            <Form.Item label="City" name="cityId" rules={[{ required: true, message: 'Please select a city' }]}>
              <Select
                showSearch
                placeholder="Select a city"
                optionFilterProp="label"
                options={cities.map((c) => ({ value: c.id, label: `${c.name}, ${c.countryName}` }))}
              />
            </Form.Item>
            <Row gutter={12}>
              <Col span={16}>
                <Form.Item label="Street" name="street" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="House number" name="houseNumber" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Category" name="hotelCategoryId" rules={[{ required: true, message: 'Please select a category' }]}>
              <Select placeholder="Select a category" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Star rating" name="starRating" rules={[{ required: true }]}>
              <InputNumber min={1} max={5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Check-in from" name="arrivalFrom" rules={[{ required: true }]}>
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Check-in to" name="arrivalTo" rules={[{ required: true }]}>
              <Input type="time" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Check-out from" name="departureFrom" rules={[{ required: true }]}>
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Check-out to" name="departureTo" rules={[{ required: true }]}>
              <Input type="time" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
