import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, InputNumber, Row, Col, message } from 'antd';
import { roomVariantApi, type RoomVariant } from '@entities/room-variant';

interface FormValues {
  price: number;
  discountPrice: number | null;
  adultCount: number;
  childCount: number;
  singleBedCount: number;
  doubleBedCount: number;
  extraBedCount: number;
  sofaCount: number;
  kingsizeBedCount: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  roomId: number;
  editingVariant?: RoomVariant | null;
}

export function RoomVariantFormModal({ open, onClose, onSaved, roomId, editingVariant }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingVariant) {
      form.setFieldsValue({
        price: editingVariant.price,
        discountPrice: editingVariant.discountPrice,
        adultCount: editingVariant.adultCount,
        childCount: editingVariant.childCount,
        singleBedCount: editingVariant.singleBedCount,
        doubleBedCount: editingVariant.doubleBedCount,
        extraBedCount: editingVariant.extraBedCount,
        sofaCount: editingVariant.sofaCount,
        kingsizeBedCount: editingVariant.kingsizeBedCount,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        adultCount: 2, childCount: 0, singleBedCount: 0, doubleBedCount: 1,
        extraBedCount: 0, sofaCount: 0, kingsizeBedCount: 0, discountPrice: null,
      });
    }
  }, [open, editingVariant, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const dto = {
        price: values.price,
        discountPrice: values.discountPrice ?? null,
        roomId,
        adultCount: values.adultCount,
        childCount: values.childCount,
        singleBedCount: values.singleBedCount,
        doubleBedCount: values.doubleBedCount,
        extraBedCount: values.extraBedCount,
        sofaCount: values.sofaCount,
        kingsizeBedCount: values.kingsizeBedCount,
      };

      if (editingVariant) {
        await roomVariantApi.update(editingVariant.id, dto);
      } else {
        await roomVariantApi.create(dto);
      }

      message.success(editingVariant ? t('host.rateForm.rateUpdated') : t('host.rateForm.rateAdded'));
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('host.rateForm.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editingVariant ? t('host.rateForm.editRate') : t('host.rateForm.addRate')}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={editingVariant ? t('common.save') : t('common.add')}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label={t('host.rateForm.pricePerNight')} name="price" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} prefix="$" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('host.rateForm.discountPrice')} name="discountPrice">
              <InputNumber min={0} style={{ width: '100%' }} prefix="$" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label={t('search.adults')} name="adultCount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('search.children')} name="childCount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={6}>
            <Form.Item label={t('host.rateForm.singleBeds')} name="singleBedCount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('host.rateForm.doubleBeds')} name="doubleBedCount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('host.rateForm.kingsizeBeds')} name="kingsizeBedCount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('host.rateForm.sofas')} name="sofaCount" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('host.rateForm.extraBeds')} name="extraBedCount" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
