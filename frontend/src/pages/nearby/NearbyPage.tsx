import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Select, Empty } from 'antd';
import { cityApi, type City } from '@entities/city';
import { NearbyPlacesList } from '@widgets/nearby-places';
import { localizeCityName, localizeCountryName } from '@shared/lib/geoNames';

export function NearbyPage() {
  const { t, i18n } = useTranslation();
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState<number | undefined>(undefined);

  useEffect(() => {
    cityApi.getAll().then(setCities).catch(() => setCities([]));
  }, []);

  return (
    <section style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('header.nearby')}</Typography.Title>

      <Select
        showSearch
        allowClear
        placeholder={t('nearby.selectCity')}
        optionFilterProp="label"
        style={{ width: 280, marginBottom: 16 }}
        value={cityId}
        onChange={setCityId}
        options={cities.map((c) => ({
          value: c.id,
          label: `${localizeCityName(c.name, i18n.language)}, ${localizeCountryName(c.countryName, i18n.language)}`,
        }))}
      />

      {cityId ? (
        <NearbyPlacesList cityId={cityId} />
      ) : (
        <Empty description={t('nearby.selectCityHint')} />
      )}
    </section>
  );
}
