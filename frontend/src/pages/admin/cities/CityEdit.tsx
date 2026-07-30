import { Edit, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';
import { LocationPicker } from '@shared/ui';

const DEFAULT_CENTER = { latitude: 50.4501, longitude: 30.5234 }; // Kyiv

export function CityEdit() {
  const { formProps, saveButtonProps } = useForm();
  const { selectProps: countrySelectProps } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { pageSize: 300 },
  });

  const latitude = Form.useWatch('latitude', formProps.form) ?? DEFAULT_CENTER.latitude;
  const longitude = Form.useWatch('longitude', formProps.form) ?? DEFAULT_CENTER.longitude;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Country" name="countryId" rules={[{ required: true }]}>
          <Select {...countrySelectProps} showSearch />
        </Form.Item>
        <Form.Item label="Latitude" name="latitude" rules={[{ required: true }]} hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Longitude" name="longitude" rules={[{ required: true }]} hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Location">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => formProps.form?.setFieldsValue({ latitude: lat, longitude: lng })}
          />
        </Form.Item>
        <Form.Item label="Image URL" name="image">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Edit>
  );
}
