import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Slider, Checkbox, Typography, Divider } from 'antd';
import { hotelCategoryApi, type HotelCategory } from '@entities/hotel-category';

export interface HotelFilters {
  priceRange: [number, number];
  stars: number[];
  categoryIds: number[];
}

interface Props {
  value: HotelFilters;
  onChange: (value: HotelFilters) => void;
}

export function FiltersSidebar({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<HotelCategory[]>([]);

  const starOptions = [5, 4, 3, 2, 1].map((n) => ({ label: t('hotels.starsCount', { count: n }), value: n }));

  useEffect(() => {
    hotelCategoryApi.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <Card style={{ position: 'sticky', top: 88 }}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>{t('hotels.filterBy')}</Typography.Title>

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>{t('hotels.pricePerNight')}</Typography.Text>
      <Slider
        range
        value={value.priceRange}
        onChange={(range) => onChange({ ...value, priceRange: range as [number, number] })}
        min={0}
        max={1000}
        step={10}
        tooltip={{ formatter: (v) => `$${v}` }}
      />

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>{t('hotels.starRating')}</Typography.Text>
      <Checkbox.Group
        options={starOptions}
        value={value.stars}
        onChange={(stars) => onChange({ ...value, stars: stars as number[] })}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
      />

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>{t('hotels.propertyType')}</Typography.Text>
      <Checkbox.Group
        options={categories.map((c) => ({ label: c.name, value: c.id }))}
        value={value.categoryIds}
        onChange={(categoryIds) => onChange({ ...value, categoryIds: categoryIds as number[] })}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
      />
    </Card>
  );
}
