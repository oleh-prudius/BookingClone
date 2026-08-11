import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Slider, Checkbox, Switch, Typography, Divider } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { hotelCategoryApi, type HotelCategory } from '@entities/hotel-category';
import { hotelAmenityApi, type HotelAmenity } from '@entities/hotel-amenity';
import { formatPrice } from '@shared/lib/currency';
import { useCurrency } from '@shared/theme/CurrencyContext';

// Figma Group63 "Рейтинг" rating stars: filled #FFCC4A / empty #D7D7D7.
const STAR_FILLED_COLOR = '#FFCC4A';
const STAR_EMPTY_COLOR = '#D7D7D7';

// Figma Group63 "Комфорт" / "Спеціальні" sections group these specific amenities
// (by backend name) into toggle switches instead of a flat checkbox list.
const COMFORT_AMENITIES = ['Wi-Fi', 'Air Conditioning', 'Kitchen', 'TV', 'Pool'];
const SPECIAL_AMENITIES = ['Parking', 'Pet Friendly', 'Breakfast Included', 'Work-friendly'];

export interface HotelFilters {
  priceRange: [number, number];
  stars: number[];
  categoryIds: number[];
  amenityIds: number[];
}

interface Props {
  value: HotelFilters;
  onChange: (value: HotelFilters) => void;
}

export function FiltersSidebar({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const [categories, setCategories] = useState<HotelCategory[]>([]);
  const [amenities, setAmenities] = useState<HotelAmenity[]>([]);

  const toggleStar = (n: number) => {
    const stars = value.stars.includes(n) ? value.stars.filter((s) => s !== n) : [...value.stars, n];
    onChange({ ...value, stars });
  };

  const toggleAmenity = (id: number) => {
    const amenityIds = value.amenityIds.includes(id)
      ? value.amenityIds.filter((a) => a !== id)
      : [...value.amenityIds, id];
    onChange({ ...value, amenityIds });
  };

  useEffect(() => {
    hotelCategoryApi.getAll().then(setCategories).catch(() => setCategories([]));
    hotelAmenityApi.getAll().then(setAmenities).catch(() => setAmenities([]));
  }, []);

  const amenityRow = (amenity: HotelAmenity) => (
    <div key={amenity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Typography.Text>{t(`hotels.amenityNames.${amenity.name}`, amenity.name)}</Typography.Text>
      <Switch checked={value.amenityIds.includes(amenity.id)} onChange={() => toggleAmenity(amenity.id)} />
    </div>
  );

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
        tooltip={{ formatter: (v) => (v != null ? formatPrice(v, currency) : '') }}
      />

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>{t('hotels.starRating')}</Typography.Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {[5, 4, 3, 2, 1].map((n) => (
          <div
            key={n}
            onClick={() => toggleStar(n)}
            role="checkbox"
            aria-checked={value.stars.includes(n)}
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 6,
              background: value.stars.includes(n) ? 'var(--triply-backgroundLight)' : 'transparent',
            }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <StarFilled key={i} style={{ color: i < n ? STAR_FILLED_COLOR : STAR_EMPTY_COLOR, fontSize: 16 }} />
            ))}
            <Typography.Text style={{ marginLeft: 6 }}>{t('hotels.starsCount', { count: n })}</Typography.Text>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '12px 0' }} />
      <Typography.Text strong>{t('hotels.propertyType')}</Typography.Text>
      <Checkbox.Group
        options={categories.map((c) => ({ label: c.name, value: c.id }))}
        value={value.categoryIds}
        onChange={(categoryIds) => onChange({ ...value, categoryIds: categoryIds as number[] })}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
      />

      {amenities.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Typography.Text strong>{t('hotels.comfort')}</Typography.Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {amenities.filter((a) => COMFORT_AMENITIES.includes(a.name)).map(amenityRow)}
          </div>

          <Divider style={{ margin: '12px 0' }} />
          <Typography.Text strong>{t('hotels.special')}</Typography.Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {amenities.filter((a) => SPECIAL_AMENITIES.includes(a.name)).map(amenityRow)}
          </div>
        </>
      )}
    </Card>
  );
}
