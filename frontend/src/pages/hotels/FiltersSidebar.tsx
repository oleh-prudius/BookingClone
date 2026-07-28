import { Card, Slider, Checkbox, Typography, Divider } from 'antd';

const STAR_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ label: `${n} star${n > 1 ? 's' : ''}`, value: n }));
const PROPERTY_TYPE_OPTIONS = ['Hotels', 'Apartments', 'Resorts', 'Villas', 'Hostels'].map((label) => ({ label, value: label }));

export function FiltersSidebar() {
  return (
    <Card style={{ position: 'sticky', top: 88 }}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Filter by</Typography.Title>

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>Price per night</Typography.Text>
      <Slider range defaultValue={[0, 500]} min={0} max={1000} step={10} tooltip={{ formatter: (v) => `$${v}` }} />

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>Star rating</Typography.Text>
      <Checkbox.Group
        options={STAR_OPTIONS}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
      />

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>Property type</Typography.Text>
      <Checkbox.Group
        options={PROPERTY_TYPE_OPTIONS}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
      />
    </Card>
  );
}
