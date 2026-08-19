import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Segmented, Spin, Empty, Row, Col } from 'antd';
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
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotelId && !cityId) {
      setPlaces([]);
      return;
    }
    setLoading(true);
    placeApi
      .getNearby({ hotelId, cityId, category: category === 'all' ? undefined : category })
      .then(setPlaces)
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [hotelId, cityId, category]);

  const categoryOptions = [
    { label: t('nearby.allCategories'), value: 'all' as const },
    ...PLACE_CATEGORIES.map((c) => ({ label: t(`nearby.categories.${c}`), value: c })),
  ];

  return (
    <div>
      <Segmented
        options={categoryOptions}
        value={category}
        onChange={(v) => setCategory(v as PlaceCategory | 'all')}
        style={{ marginBottom: 20 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : !hotelId && !cityId ? (
        <Empty description={t('nearby.selectCityHint')} />
      ) : places.length === 0 ? (
        <Empty description={t('nearby.noPlaces')} />
      ) : (
        <Row gutter={[16, 16]}>
          {places.map((place) => (
            <Col key={place.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ width: '100%' }}
                styles={{ body: { padding: 14 } }}
                cover={
                  <img
                    src={place.photoUrl ?? CATEGORY_PHOTOS[place.category]}
                    alt={place.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                  />
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>{place.name}</strong>
                  {place.distanceKm != null && (
                    <span style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-h)', flexShrink: 0 }}>
                      <EnvironmentOutlined /> {t('nearby.distanceKm', { km: place.distanceKm })}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 2, marginBottom: 6, fontSize: 12, color: 'var(--triply-textAccent)', fontWeight: 500 }}>
                  {t(`nearby.categories.${place.category}`)}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                  {place.description ?? t(`nearby.descriptions.${place.category}`)}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
