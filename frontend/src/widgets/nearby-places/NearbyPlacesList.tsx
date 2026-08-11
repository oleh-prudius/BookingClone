import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List, Tag, Select, Spin, Empty } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { placeApi, PLACE_CATEGORIES, type Place, type PlaceCategory } from '@entities/place';

interface Props {
  hotelId?: number;
  cityId?: number;
}

const CATEGORY_PHOTOS: Record<PlaceCategory, string> = {
  Restaurant:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Restaurant_table_at_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg/960px-Restaurant_table_at_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg',
  Landmark:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/960px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  Museum:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Writers_Museum_interior_with_exhibit_rooms.jpg/960px-Writers_Museum_interior_with_exhibit_rooms.jpg',
  Park:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Path_by_the_trees_in_Regents_Park_-_geograph.org.uk_-_6070404.jpg/960px-Path_by_the_trees_in_Regents_Park_-_geograph.org.uk_-_6070404.jpg',
  Shopping:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Storefronts_on_Bridgeway%2C_Sausalito-L1003865.jpg/960px-Storefronts_on_Bridgeway%2C_Sausalito-L1003865.jpg',
};

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
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={places}
          renderItem={(place) => (
            <List.Item>
              <div
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  height: '100%',
                }}
              >
                <img
                  src={place.photoUrl ?? CATEGORY_PHOTOS[place.category]}
                  alt={place.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <strong>{place.name}</strong>
                    {place.distanceKm != null && (
                      <span style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-h)' }}>
                        <EnvironmentOutlined /> {t('nearby.distanceKm', { km: place.distanceKm })}
                      </span>
                    )}
                  </div>
                  <div style={{ margin: '6px 0' }}>
                    <Tag>{t(`nearby.categories.${place.category}`)}</Tag>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-h)' }}>
                    {t(`nearby.descriptions.${place.category}`)}
                  </p>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
