import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List, Tag, Select, Spin, Empty } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { placeApi, PLACE_CATEGORIES, type Place, type PlaceCategory } from '@entities/place';

interface Props {
  hotelId?: number;
  cityId?: number;
}

export function NearbyPlacesList({ hotelId, cityId }: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<PlaceCategory | undefined>(undefined);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotelId && !cityId) {
      setPlaces([]);
      return;
    }
    setLoading(true);
    placeApi
      .getNearby({ hotelId, cityId, category })
      .then(setPlaces)
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [hotelId, cityId, category]);

  return (
    <div>
      <Select
        allowClear
        placeholder={t('nearby.allCategories')}
        style={{ width: 200, marginBottom: 16 }}
        value={category}
        onChange={setCategory}
        options={PLACE_CATEGORIES.map((c) => ({ value: c, label: t(`nearby.categories.${c}`) }))}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : !hotelId && !cityId ? (
        <Empty description={t('nearby.selectCityHint')} />
      ) : places.length === 0 ? (
        <Empty description={t('nearby.noPlaces')} />
      ) : (
        <List
          dataSource={places}
          renderItem={(place) => (
            <List.Item>
              <List.Item.Meta
                avatar={<EnvironmentOutlined style={{ fontSize: 20 }} />}
                title={place.name}
                description={<Tag>{t(`nearby.categories.${place.category}`)}</Tag>}
              />
              {place.distanceKm != null && (
                <span>{t('nearby.distanceKm', { km: place.distanceKm })}</span>
              )}
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
