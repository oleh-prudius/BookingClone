import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, InputNumber } from 'antd';

export function HotelEdit() {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Address ID" name="addressId" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>
        <Form.Item label="Hotel Category ID" name="hotelCategoryId" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>
        <Form.Item label="Realtor ID" name="realtorId" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>
        <Form.Item label="Star Rating" name="starRating" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} max={5} />
        </Form.Item>
        <Form.Item label="Arrival From (ISO)" name="arrivalTimeUtcFrom" rules={[{ required: true }]}>
          <Input placeholder="2000-01-01T14:00:00+00:00" />
        </Form.Item>
        <Form.Item label="Arrival To (ISO)" name="arrivalTimeUtcTo" rules={[{ required: true }]}>
          <Input placeholder="2000-01-01T22:00:00+00:00" />
        </Form.Item>
        <Form.Item label="Departure From (ISO)" name="departureTimeUtcFrom" rules={[{ required: true }]}>
          <Input placeholder="2000-01-01T10:00:00+00:00" />
        </Form.Item>
        <Form.Item label="Departure To (ISO)" name="departureTimeUtcTo" rules={[{ required: true }]}>
          <Input placeholder="2000-01-01T12:00:00+00:00" />
        </Form.Item>
      </Form>
    </Edit>
  );
}
